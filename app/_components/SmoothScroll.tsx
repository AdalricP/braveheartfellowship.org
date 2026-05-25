"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let frame = 0;

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

    function animate() {
      currentY += (targetY - currentY) * 0.18;

      if (Math.abs(targetY - currentY) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        frame = 0;
        return;
      }

      window.scrollTo(0, currentY);
      frame = requestAnimationFrame(animate);
    }

    function onWheel(event: WheelEvent) {
      if (event.ctrlKey || event.metaKey) return;
      if ((event.target as HTMLElement | null)?.closest("input, textarea, select, #apply-panel")) return;

      event.preventDefault();
      targetY = Math.max(0, Math.min(maxScroll(), targetY + event.deltaY));

      if (!frame) {
        currentY = window.scrollY;
        frame = requestAnimationFrame(animate);
      }
    }

    function syncScroll() {
      if (frame) return;
      targetY = window.scrollY;
      currentY = window.scrollY;
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", syncScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", syncScroll);
      window.removeEventListener("resize", syncScroll);
    };
  }, []);

  return null;
}
