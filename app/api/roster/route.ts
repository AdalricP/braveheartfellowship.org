import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RosterRow = {
  name: string;
  role: string;
  note: string;
  image?: string;
};

type AirtableRecord = {
  fields?: Record<string, unknown>;
};

function fieldStr(record: AirtableRecord, key: string): string {
  const value = record.fields?.[key];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

async function fetchApproved(baseId: string, pat: string, tableName: string, defaultRole: string): Promise<RosterRow[]> {
  try {
    const endpoint = new URL(
      `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`,
      "https://api.airtable.com",
    );
    endpoint.searchParams.set("filterByFormula", '{Status} = "Approved"');
    endpoint.searchParams.append("fields[]", "Name");
    endpoint.searchParams.append("fields[]", "Work Description");
    endpoint.searchParams.append("fields[]", "Status");

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${pat}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as { records?: AirtableRecord[] };
    const records = payload.records || [];

    return records.map((record) => ({
      name: fieldStr(record, "Name"),
      role: defaultRole,
      note: fieldStr(record, "Work Description"),
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const pat = process.env.AIRTABLE_PAT;

  if (!baseId || !pat) {
    return NextResponse.json({ ok: true, fellows: [], grantees: [] });
  }

  const fellowshipTable = process.env.AIRTABLE_TABLE_FELLOWSHIP || "Fellowship";
  const grantTable = process.env.AIRTABLE_TABLE_GRANT || "Grant";

  const [fellows, grantees] = await Promise.all([
    fetchApproved(baseId, pat, fellowshipTable, "fellowship"),
    fetchApproved(baseId, pat, grantTable, "micro grant"),
  ]);

  return NextResponse.json({ ok: true, fellows, grantees });
}
