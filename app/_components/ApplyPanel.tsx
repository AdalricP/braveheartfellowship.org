"use client";

import { useState } from "react";
import { useApplyPanel } from "./ApplyPanelContext";

type Status = { message: string; tone: "" | "is-error" | "is-success"; html?: boolean };

export default function ApplyPanel() {
  const { isOpen, applyType, close } = useApplyPanel();
  const [status, setStatus] = useState<Status>({ message: "", tone: "" });
  const [submitting, setSubmitting] = useState(false);

  const label = applyType === "grant" ? "Grant" : "Fellowship";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const payload = {
      source: "braveheart_application",
      application_type: applyType,
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      referral_code: String(data.get("referral_code") || ""),
      work_description: String(data.get("work_description") || ""),
      scholar_link: String(data.get("scholar_link") || ""),
      social_link: String(data.get("social_link") || ""),
      proudest_work: String(data.get("proudest_work") || ""),
    };

    setSubmitting(true);
    setStatus({ message: "Checking referral code...", tone: "" });

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        if (result.code === "INVALID_REFERRAL") {
          setStatus({
            message: 'Referral code is not valid. <a href="#fellows-grantees">See fellows / grantees.</a>',
            tone: "is-error",
            html: true,
          });
          return;
        }
        throw new Error(result.message || "Submission failed.");
      }
      form.reset();
      if (result.pending_approval) {
        setStatus({ message: "Application received. Waiting for approval.", tone: "is-success" });
      } else if (result.review_email_sent === false) {
        setStatus({
          message: "Application received, but the approval email could not be sent.",
          tone: "is-error",
        });
      } else {
        setStatus({ message: "Application received.", tone: "is-success" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setStatus({ message, tone: "is-error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <aside
      id="apply-panel"
      className={`apply-panel${isOpen ? " is-open" : ""}`}
      aria-hidden={!isOpen}
      aria-labelledby="apply-title"
    >
      <button type="button" className="panel-close" aria-label="Close application" onClick={close}>
        →
      </button>
      <div className="panel-heading">
        <span>application</span>
        <h2 id="apply-title">{label}</h2>
      </div>
      <form className="apply-form" onSubmit={onSubmit} noValidate>
        <label>
          <input type="text" name="name" autoComplete="name" placeholder="Name" aria-label="Name" required />
        </label>
        <label>
          <input type="email" name="email" autoComplete="email" placeholder="Email" aria-label="Email" required />
        </label>
        <label>
          <input
            type="text"
            name="referral_code"
            autoComplete="off"
            placeholder="Referral code"
            aria-label="Referral code"
            required
          />
        </label>
        <label>
          <textarea
            name="work_description"
            rows={3}
            placeholder="What are you working on?"
            aria-label="What are you working on?"
            required
          />
        </label>
        <label>
          <input
            type="url"
            name="scholar_link"
            autoComplete="url"
            placeholder="Google Scholar / GitHub / Drive proof"
            aria-label="Google Scholar, GitHub, or Google Drive proof of work link"
          />
        </label>
        <label>
          <input
            type="url"
            name="social_link"
            autoComplete="url"
            placeholder="LinkedIn / X link"
            aria-label="LinkedIn or X link"
          />
        </label>
        <label>
          <textarea
            name="proudest_work"
            rows={3}
            placeholder="Thing you have built or researched that you are proudest of"
            aria-label="Thing you have built or researched that you are proudest of"
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          submit application
        </button>
        {status.html ? (
          <p
            className={`form-status ${status.tone}`.trim()}
            role="status"
            aria-live="polite"
            dangerouslySetInnerHTML={{ __html: status.message }}
          />
        ) : (
          <p className={`form-status ${status.tone}`.trim()} role="status" aria-live="polite">
            {status.message}
          </p>
        )}
      </form>
    </aside>
  );
}
