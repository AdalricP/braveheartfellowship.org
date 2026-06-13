"use client";

import Reveal from "./Reveal";
import { useApplyPanel } from "./ApplyPanelContext";

export default function Closing() {
  const { open } = useApplyPanel();

  return (
    <>
      <section className="band closing" id="apply">
        <div className="wrap">
          <Reveal>
            <p className="latin">Fortune favours the bold</p>
            <h2 className="display">
              Go against <em>the world.</em>
            </h2>
          </Reveal>
          <Reveal delay={100} className="cta-row">
            <button type="button" className="btn" onClick={() => open("fellowship")}>
              Apply for the fellowship <span className="arrow" aria-hidden="true">↗</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => open("grant")}>
              Request a micro-grant <span className="arrow" aria-hidden="true">→</span>
            </button>
          </Reveal>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-inner">
          <div className="partners">
            <img src="/assets/forge_logo.png" alt="Forge" />
            <img src="/assets/lotusfund.png" alt="Lotus Fund" />
            <img src="/assets/lagrange_point_logo.jpg" alt="Lagrange Point" />
          </div>
          <div className="colophon">
            <span>Braveheart Fellowship</span>
            <a href="mailto:aryan@braveheartfellowship.org">aryan@braveheartfellowship.org</a>
          </div>
        </div>
      </footer>
    </>
  );
}
