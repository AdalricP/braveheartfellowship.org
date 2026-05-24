"use client";

import { useState } from "react";
import DescriptionBlock from "./DescriptionBlock";
import { useApplyPanel } from "./ApplyPanelContext";

export default function HeroPage() {
  const { open } = useApplyPanel();
  const [revealed, setRevealed] = useState(false);
  const [changing, setChanging] = useState(false);

  const onContact = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (revealed) return;
    event.preventDefault();
    setChanging(true);
    window.setTimeout(() => {
      setRevealed(true);
      setChanging(false);
    }, 180);
  };

  return (
    <section className="page hero-page" id="hero" data-page>
      <div className="page-inner">
        <section className="intro">
          <h1>Braveheart Fellowship</h1>
          <p>
            Audentes Fortuna Iuvat, Fortune favours the bold.<br />
            We back young founders and researchers willing to go against the world in pursuit of truth.
          </p>
          <nav className="links" aria-label="Primary links">
            <a
              href="#fellowship"
              data-open-apply
              data-apply-type="fellowship"
              onClick={(e) => {
                e.preventDefault();
                open("fellowship");
              }}
            >
              <span>fellowship</span>
              <span aria-hidden="true">→</span>
            </a>
            <a
              href="#grant"
              data-open-apply
              data-apply-type="grant"
              onClick={(e) => {
                e.preventDefault();
                open("grant");
              }}
            >
              <span>grant</span>
              <span aria-hidden="true">→</span>
            </a>
            <a
              href={revealed ? "mailto:applications@braveheartfellowship.org" : "#contact"}
              data-contact-link
              data-revealed={revealed ? "true" : undefined}
              onClick={onContact}
            >
              <span className={`contact-text${changing ? " is-changing" : ""}`}>
                {revealed ? "applications@braveheartfellowship.org" : "contact"}
              </span>
              <span className={`contact-arrow${changing ? " is-changing" : ""}`} aria-hidden="true">
                {revealed ? "↗" : "→"}
              </span>
            </a>
          </nav>
        </section>

        <DescriptionBlock />
      </div>
    </section>
  );
}
