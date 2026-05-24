"use client";

import { useRef, useState } from "react";

export default function DescriptionBlock() {
  const blockRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const block = blockRef.current;
    const content = contentRef.current;
    if (!block || !content) return;

    if (block.hasAttribute("open")) {
      content.style.maxHeight = `${content.scrollHeight}px`;
      requestAnimationFrame(() => {
        setIsOpen(false);
        content.style.maxHeight = "0px";
      });
      window.setTimeout(() => {
        block.removeAttribute("open");
      }, 320);
      return;
    }

    block.setAttribute("open", "");
    content.style.maxHeight = "0px";
    requestAnimationFrame(() => {
      setIsOpen(true);
      content.style.maxHeight = `${content.scrollHeight}px`;
    });
  };

  return (
    <details ref={blockRef} className={`description-block${isOpen ? " is-open" : ""}`}>
      <summary onClick={toggle}>Description</summary>
      <div className="description-content" ref={contentRef}>
        <ul>
          <li>
            We back young founders and researchers at the start of their journey, seeking
            individuals from underprivileged backgrounds. Focusing on theoretical physics and
            mathematics, Braveheart will be your first believer.
          </li>
          <li>
            $200 checks, journal access, accommodation, mentorship from a network of professors,
            entrepreneurs, investors, and innovators spread across five countries, and more.
            Everything needed to pull a Boltzmann or Dirac out of someone.
          </li>
        </ul>
      </div>
    </details>
  );
}
