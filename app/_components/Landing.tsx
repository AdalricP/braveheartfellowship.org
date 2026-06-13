"use client";

import PixelPainting from "./PixelPainting";
import Roster from "./Roster";
import { useApplyPanel } from "./ApplyPanelContext";

export default function Landing() {
  const { open } = useApplyPanel();

  return (
    <main className="shell">
      <div className="stack">
        <PixelPainting />

        <section>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-mark" src="/assets/icon.png" alt="Braveheart" />
          <h1 className="brand">Braveheart Fellowship</h1>
          <p className="tagline">Audentes Fortuna Iuvat.</p>
          <p className="intro">
            Starting early is hard. The best researchers do it anyways. We want to bet on the best
            scientific, entrepreneurial and innovation talent in the world, right at the start of their
            journey when they have zero credentials. Ability can be built; attitude and competency
            matter more.
          </p>
        </section>

        <section>
          <p className="block-title">What you get</p>
          <ul className="give-list">
            <li>Access to journals</li>
            <li>The research network</li>
            <li>AI, cloud compute, and deep research</li>
            <li>Equipment, hardware, and the lab</li>
          </ul>
        </section>

        <nav className="actions" aria-label="Apply">
          <button type="button" className="link" onClick={() => open("fellowship")}>
            Apply for the fellowship
          </button>
          <button type="button" className="link" onClick={() => open("grant")}>
            Apply for a grant
          </button>
          <a className="link link-muted" href="/thesis">
            Read the thesis
          </a>
        </nav>

        <Roster />

        <footer className="site-footer">
          <a href="mailto:aryan@braveheartfellowship.org">aryan@braveheartfellowship.org</a>
        </footer>
      </div>
    </main>
  );
}
