"use client";

import PixelPainting from "./PixelPainting";
import Reveal from "./Reveal";
import { useApplyPanel } from "./ApplyPanelContext";

export default function HeroPage() {
  const { open } = useApplyPanel();

  return (
    <section className="band hero" id="top">
      <div className="wrap hero-grid">
        <Reveal as="header" className="hero-head">
          <p className="eyebrow">Audentes Fortuna Iuvat · Fortune favours the bold</p>
          <h1 className="display">
            We back the ones who go <em>against the world</em> in pursuit of truth.
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <PixelPainting />
        </Reveal>

        <Reveal delay={80} className="hero-lede-row">
          <p className="lede">
            Braveheart finds young founders and researchers at the very start — often working alone,
            often from underprivileged backgrounds — and becomes their first believer.
          </p>
          <div className="cta-row">
            <button type="button" className="btn" onClick={() => open("fellowship")}>
              Apply for the fellowship <span className="arrow" aria-hidden="true">↗</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => open("grant")}>
              Request a micro-grant <span className="arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
