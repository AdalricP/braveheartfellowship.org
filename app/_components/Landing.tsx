"use client";

import { useState } from "react";
import PixelPainting from "./PixelPainting";
import Roster from "./Roster";
import { useApplyPanel } from "./ApplyPanelContext";

export default function Landing() {
  const { open } = useApplyPanel();
  const [emailRevealed, setEmailRevealed] = useState(false);

  return (
    <main className="shell">
      <a className="site-mark" href="/" aria-label="Braveheart Fellowship">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/braveheart-mark.png" alt="Braveheart" />
      </a>
      <div className="stack">
        <PixelPainting />

        <section>
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
          <p className="block-title">What</p>
          <p className="give-text">
            A one-year program with access to the best professor networks, the models, and the
            journals — everything you need to do groundbreaking research from your basement.
          </p>
        </section>

        <nav className="actions" aria-label="Apply">
          <button type="button" className="link" onClick={() => open("fellowship")}>
            Apply for the fellowship
          </button>
          {emailRevealed ? (
            <a className="link" href="mailto:aryan@braveheartfellowship.org">
              aryan@braveheartfellowship.org
            </a>
          ) : (
            <button type="button" className="link" onClick={() => setEmailRevealed(true)}>
              Get in touch
            </button>
          )}
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
