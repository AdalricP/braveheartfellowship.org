"use client";

import { useEffect, useState } from "react";

export default function SectionJump() {
  const [isLast, setIsLast] = useState(false);

  useEffect(() => {
    const pages = Array.from(document.querySelectorAll<HTMLElement>("[data-page]"));
    if (!pages.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let topEntry: IntersectionObserverEntry | null = null;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!topEntry || entry.intersectionRatio > topEntry.intersectionRatio) {
            topEntry = entry;
          }
        });
        if (!topEntry) return;
        const index = pages.indexOf((topEntry as IntersectionObserverEntry).target as HTMLElement);
        setIsLast(index >= pages.length - 1);
      },
      { threshold: [0.35, 0.6, 0.85] },
    );

    pages.forEach((p) => observer.observe(p));
    return () => observer.disconnect();
  }, []);

  const onClick = () => {
    const pages = Array.from(document.querySelectorAll<HTMLElement>("[data-page]"));
    if (!pages.length) return;
    const scrollY = window.scrollY;
    const currentIdx = pages.findIndex((p) => p.offsetTop > scrollY + 4);
    const nextIdx = currentIdx === -1 ? 0 : currentIdx;
    pages[nextIdx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`section-jump${isLast ? " is-last" : ""}`}
      aria-label={isLast ? "Scroll to first section" : "Scroll to next section"}
    >
      <span aria-hidden="true">+</span>
    </button>
  );
}
