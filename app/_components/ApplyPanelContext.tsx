"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ApplyType = "fellowship" | "grant";

type Ctx = {
  isOpen: boolean;
  applyType: ApplyType;
  open: (type: ApplyType) => void;
  close: () => void;
};

const ApplyPanelCtx = createContext<Ctx | null>(null);

const PANEL_TRANSITION_MS = 360;

export function ApplyPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [applyType, setApplyType] = useState<ApplyType>("fellowship");
  const switchTimer = useRef<number | undefined>(undefined);

  const close = useCallback(() => {
    window.clearTimeout(switchTimer.current);
    setIsOpen(false);
  }, []);

  const open = useCallback(
    (type: ApplyType) => {
      window.clearTimeout(switchTimer.current);
      setIsOpen((prevOpen) => {
        setApplyType((prevType) => {
          if (!prevOpen) return type;
          if (prevType === type) return prevType;
          switchTimer.current = window.setTimeout(() => {
            setApplyType(type);
            setIsOpen(true);
          }, PANEL_TRANSITION_MS);
          return prevType;
        });
        if (!prevOpen) return true;
        if (applyType === type) return false;
        return false;
      });
    },
    [applyType],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!isOpen) return;
      const target = e.target as HTMLElement | null;
      const panel = document.getElementById("apply-panel");
      if (panel?.contains(target as Node)) return;
      if (target?.closest("[data-open-apply]")) return;
      close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const { style: bodyStyle } = document.body;
    const { style: htmlStyle } = document.documentElement;
    const previousBodyOverflow = bodyStyle.overflow;
    const previousHtmlOverflow = htmlStyle.overflow;
    bodyStyle.overflow = "hidden";
    htmlStyle.overflow = "hidden";
    return () => {
      bodyStyle.overflow = previousBodyOverflow;
      htmlStyle.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  const value = useMemo(() => ({ isOpen, applyType, open, close }), [isOpen, applyType, open, close]);
  return <ApplyPanelCtx.Provider value={value}>{children}</ApplyPanelCtx.Provider>;
}

export function useApplyPanel() {
  const ctx = useContext(ApplyPanelCtx);
  if (!ctx) throw new Error("useApplyPanel must be used inside ApplyPanelProvider");
  return ctx;
}
