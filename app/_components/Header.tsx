"use client";

import { useState } from "react";
import { useApplyPanel } from "./ApplyPanelContext";

export default function Header() {
  const { open } = useApplyPanel();
  const [revealed, setRevealed] = useState(false);

  const onContact = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (revealed) return;
    event.preventDefault();
    setRevealed(true);
  };

  return (
    <header className="masthead">
      <div className="wrap masthead-inner">
        <a className="wordmark" href="#top">
          Braveheart
          <span>est. mmxxv</span>
        </a>
        <nav className="topnav" aria-label="Primary">
          <button type="button" onClick={() => open("fellowship")}>
            Fellowship
          </button>
          <button type="button" onClick={() => open("grant")}>
            Grant
          </button>
          <a
            className="nav-mono-hide"
            href={revealed ? "mailto:aryan@braveheartfellowship.org" : "#contact"}
            onClick={onContact}
          >
            {revealed ? "aryan@braveheartfellowship.org" : "Contact"}
          </a>
        </nav>
      </div>
    </header>
  );
}
