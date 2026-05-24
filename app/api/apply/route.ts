import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type ApplyType = "fellowship" | "grant";

type ApplyPayload = {
  application_type?: string;
  name?: string;
  email?: string;
  referral_code?: string;
  work_description?: string;
  scholar_link?: string;
  social_link?: string;
  proudest_work?: string;
};

function tableNameFor(type: ApplyType) {
  return type === "grant"
    ? process.env.AIRTABLE_TABLE_GRANT || "Grant"
    : process.env.AIRTABLE_TABLE_FELLOWSHIP || "Fellowship";
}

function normalizeType(value: unknown): ApplyType {
  return value === "grant" ? "grant" : "fellowship";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(type: ApplyType, payload: ApplyPayload) {
  const label = type === "grant" ? "Grant" : "Fellowship";
  const rows: [string, string][] = [
    ["Name", payload.name || ""],
    ["Email", payload.email || ""],
    ["Referral", payload.referral_code || ""],
    ["Working on", payload.work_description || ""],
    ["Scholar / GitHub / Drive", payload.scholar_link || ""],
    ["LinkedIn / X", payload.social_link || ""],
    ["Proudest work", payload.proudest_work || ""],
  ];

  const rowHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#888;font-family:monospace;font-size:12px;vertical-align:top;text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(k)}</td><td style="padding:6px 0;color:#111;font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");

  return `<div style="background:#fafaf7;padding:32px;font-family:system-ui,sans-serif;">
    <h2 style="margin:0 0 18px;font-weight:500;font-size:20px;color:#111;">New ${label} application</h2>
    <table style="border-collapse:collapse;width:100%;max-width:560px;">${rowHtml}</table>
  </div>`;
}

async function createAirtableRecord(baseId: string, pat: string, tableName: string, payload: ApplyPayload) {
  const endpoint = new URL(
    `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`,
    "https://api.airtable.com",
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            Name: payload.name,
            Email: payload.email,
            "Referral Code": payload.referral_code,
            "Work Description": payload.work_description,
            "Scholar Link": payload.scholar_link || undefined,
            "Social Link": payload.social_link || undefined,
            "Proudest Work": payload.proudest_work,
            Status: "Pending",
            "Submitted At": new Date().toISOString(),
          },
        },
      ],
    }),
  });

  if (response.ok) return;

  let message = "Airtable error.";

  try {
    const errorPayload = (await response.json()) as {
      error?: { message?: string; type?: string };
    };
    message = errorPayload.error?.message || errorPayload.error?.type || message;
  } catch {
    message = response.statusText || message;
  }

  throw new Error(message);
}

export async function POST(request: Request) {
  let payload: ApplyPayload;
  try {
    payload = (await request.json()) as ApplyPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const type = normalizeType(payload.application_type);

  if (!payload.name || !payload.email || !payload.referral_code || !payload.work_description || !payload.proudest_work) {
    return NextResponse.json(
      { ok: false, message: "Missing required fields." },
      { status: 400 },
    );
  }

  const baseId = process.env.AIRTABLE_BASE_ID;
  const pat = process.env.AIRTABLE_PAT;
  if (!baseId || !pat) {
    return NextResponse.json(
      { ok: false, message: "Airtable is not configured." },
      { status: 500 },
    );
  }

  try {
    await createAirtableRecord(baseId, pat, tableNameFor(type), payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Airtable error.";
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }

  let reviewEmailSent = true;
  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.APPROVAL_NOTIFY_EMAIL;
  const fromEmail = process.env.APPROVAL_FROM_EMAIL || "onboarding@resend.dev";

  if (resendKey && notifyTo) {
    try {
      const resend = new Resend(resendKey);
      const label = type === "grant" ? "Grant" : "Fellowship";
      await resend.emails.send({
        from: `Braveheart <${fromEmail}>`,
        to: notifyTo,
        subject: `New ${label} application — ${payload.name}`,
        html: buildEmailHtml(type, payload),
        replyTo: payload.email,
      });
    } catch {
      reviewEmailSent = false;
    }
  } else {
    reviewEmailSent = false;
  }

  return NextResponse.json({
    ok: true,
    pending_approval: true,
    application_type: type,
    review_email_sent: reviewEmailSent,
  });
}
