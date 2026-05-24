"use client";

import { useEffect, useRef } from "react";

const pixelAlphabet: Record<string, string[]> = {
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function CursorGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    const canvas: HTMLCanvasElement = canvasEl;

    const grid = {
      pointerX: window.innerWidth / 2,
      pointerY: window.innerHeight / 2,
      easedX: window.innerWidth / 2,
      easedY: window.innerHeight / 2,
      isSignalMode: false,
      signalProgress: 0,
      baseAlpha: 0,
      targetBaseAlpha: 0,
      opacity: 0,
      targetOpacity: 0,
      revealScale: 1,
      targetRevealScale: 1,
      fullPage: 0,
      targetFullPage: false,
      warp: 0,
      targetWarp: 0,
      dpr: 1,
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let panelGridHover = false;
    let activePageIndex = 0;
    const pages = Array.from(document.querySelectorAll<HTMLElement>("[data-page]"));

    function syncGridMode() {
      const activePage = pages[activePageIndex];
      const gridMode = activePage?.dataset.gridMode || "";
      const isSignalPage = gridMode === "signal";
      grid.isSignalMode = isSignalPage;
      grid.targetFullPage = false;
      grid.targetBaseAlpha = Math.max(grid.signalProgress * 0.28, panelGridHover ? 0.3 : 0);
      grid.targetRevealScale = 1;
      grid.targetOpacity = isSignalPage ? 0.2 : 0;
      grid.targetWarp = 0;
    }

    function updateSignalProgress() {
      const signalPage = document.querySelector<HTMLElement>("[data-grid-mode='signal']");
      if (!signalPage) return;
      const start = signalPage.offsetTop - window.innerHeight * 0.85;
      const end = signalPage.offsetTop + window.innerHeight * 0.12;
      const nextProgress = clamp((window.scrollY - start) / (end - start), 0, 1);
      grid.signalProgress += (nextProgress - grid.signalProgress) * 0.08;
      grid.targetBaseAlpha = Math.max(grid.signalProgress * 0.28, panelGridHover ? 0.3 : 0);
    }

    function resizeGrid() {
      grid.dpr = Math.min(window.devicePixelRatio || 1, 2);
      grid.width = window.innerWidth;
      grid.height = window.innerHeight;
      canvas.width = Math.round(grid.width * grid.dpr);
      canvas.height = Math.round(grid.height * grid.dpr);
      canvas.style.width = `${grid.width}px`;
      canvas.style.height = `${grid.height}px`;
      ctx!.setTransform(grid.dpr, 0, 0, grid.dpr, 0, 0);
    }

    function gravityPoint(x: number, y: number) {
      const dx = grid.easedX - x;
      const dy = grid.easedY - y;
      const distance = Math.hypot(dx, dy);
      const radius = 190;
      const pull = grid.warp * 0.34 * Math.exp(-(distance * distance) / (radius * radius));
      return { x: x + dx * pull, y: y + dy * pull };
    }

    function revealAlpha(x: number, y: number) {
      const fullPageAlpha = grid.baseAlpha;
      const distance = Math.hypot(x - grid.easedX, y - grid.easedY);
      const inner = 38 * grid.revealScale;
      const outer = 112 * grid.revealScale;
      if (grid.revealScale <= 0.01) return fullPageAlpha;
      if (distance <= inner) return Math.max(fullPageAlpha, grid.opacity);
      if (distance >= outer) return fullPageAlpha;
      const t = (distance - inner) / (outer - inner);
      return Math.max(fullPageAlpha, grid.opacity * (1 - t) * (1 - t));
    }

    function drawWarpedLine(points: { x: number; y: number }[]) {
      for (let i = 0; i < points.length - 1; i += 1) {
        const a = points[i];
        const b = points[i + 1];
        const alpha = Math.min(revealAlpha(a.x, a.y), revealAlpha(b.x, b.y));
        if (alpha <= 0.01) continue;
        const warpedA = gravityPoint(a.x, a.y);
        const warpedB = gravityPoint(b.x, b.y);
        ctx!.globalAlpha = alpha;
        ctx!.beginPath();
        ctx!.moveTo(warpedA.x, warpedA.y);
        ctx!.lineTo(warpedB.x, warpedB.y);
        ctx!.stroke();
      }
    }

    function drawSignalWordmark(spacing: number, shiftX: number, shiftY: number) {
      const wordmarkProgress = clamp((grid.signalProgress - 0.42) / 0.58, 0, 1);
      if (wordmarkProgress <= 0.01) return;

      const text = "BRAVEHEART";
      const letterGap = 1;
      const rowCount = 7;
      const patterns = text.split("").map((letter) => pixelAlphabet[letter]).filter(Boolean) as string[][];
      const totalColumns = patterns.reduce((count, pattern, index) => {
        return count + pattern[0].length + (index < patterns.length - 1 ? letterGap : 0);
      }, 0);
      const wordmarkWidth = (totalColumns - 1) * spacing;
      const wordmarkHeight = (rowCount - 1) * spacing;
      if (wordmarkWidth > grid.width * 0.9 || wordmarkHeight > grid.height * 0.34) return;

      const anchorX = Math.round(((grid.width - wordmarkWidth) / 2 - shiftX) / spacing) * spacing + shiftX;
      const anchorY = Math.round(((grid.height - wordmarkHeight) / 2 - shiftY) / spacing) * spacing + shiftY;
      const squareSize = Math.max(4, Math.floor(spacing * 0.32));
      const halfSquare = squareSize / 2;
      const time = performance.now() * 0.0024;

      ctx!.fillStyle = "rgba(255, 248, 235, 0.96)";
      ctx!.shadowColor = "rgba(255, 248, 235, 0.2)";
      ctx!.shadowBlur = 14;

      let columnOffset = 0;
      patterns.forEach((pattern, letterIndex) => {
        pattern.forEach((row, rowIndex) => {
          row.split("").forEach((bit, colIndex) => {
            if (bit !== "1") return;
            const cellX = anchorX + (columnOffset + colIndex) * spacing;
            const cellY = anchorY + rowIndex * spacing;
            const warpedCell = gravityPoint(cellX, cellY);
            const flicker = 0.84 + (0.16 * Math.sin(time + (letterIndex * 0.8) + (rowIndex * 0.45) + (colIndex * 0.2)));
            ctx!.globalAlpha = Math.min(1, wordmarkProgress * Math.max(0.72, grid.opacity + 0.18) * flicker);
            ctx!.fillRect(warpedCell.x - halfSquare, warpedCell.y - halfSquare, squareSize, squareSize);
          });
        });
        columnOffset += pattern[0].length + letterGap;
      });

      ctx!.shadowBlur = 0;
    }

    let frame = 0;
    function drawGrid() {
      updateSignalProgress();
      grid.easedX += (grid.pointerX - grid.easedX) * 0.14;
      grid.easedY += (grid.pointerY - grid.easedY) * 0.14;
      grid.baseAlpha += (grid.targetBaseAlpha - grid.baseAlpha) * 0.12;
      grid.opacity += (grid.targetOpacity - grid.opacity) * 0.12;
      grid.revealScale += (grid.targetRevealScale - grid.revealScale) * 0.03;
      grid.fullPage += ((grid.targetFullPage ? 1 : 0) - grid.fullPage) * 0.12;
      grid.warp += (grid.targetWarp - grid.warp) * 0.3;

      ctx!.clearRect(0, 0, grid.width, grid.height);
      ctx!.strokeStyle = "rgba(255, 248, 235, 0.18)";
      ctx!.lineWidth = 1;

      const spacing = 26;
      const step = 10;
      const shiftX = (grid.easedX / grid.width - 0.5) * 14;
      const shiftY = (grid.easedY / grid.height - 0.5) * 10;

      for (let x = -spacing + shiftX; x <= grid.width + spacing; x += spacing) {
        const points = [];
        for (let y = -spacing; y <= grid.height + spacing; y += step) {
          points.push({ x, y: y + shiftY });
        }
        drawWarpedLine(points);
      }

      for (let y = -spacing + shiftY; y <= grid.height + spacing; y += spacing) {
        const points = [];
        for (let x = -spacing; x <= grid.width + spacing; x += step) {
          points.push({ x: x + shiftX, y });
        }
        drawWarpedLine(points);
      }

      drawSignalWordmark(spacing, shiftX, shiftY);
      ctx!.globalAlpha = 1;
      frame = requestAnimationFrame(drawGrid);
    }

    function updatePointer(event: PointerEvent) {
      grid.pointerX = event.clientX;
      grid.pointerY = event.clientY;
      if (grid.isSignalMode) {
        grid.targetOpacity = 0.68;
        return;
      }
      if (!grid.targetFullPage) {
        grid.targetOpacity = 0.72;
      }
    }

    function releaseGridWarp() {
      grid.targetWarp = 0;
    }

    function shrinkGridReveal() {
      if (grid.targetFullPage) return;
      grid.targetRevealScale = 0;
      grid.targetOpacity = 0;
    }

    function expandGridReveal() {
      if (grid.targetFullPage) return;
      grid.targetRevealScale = 1;
      grid.targetOpacity = grid.isSignalMode ? 0.68 : 0.72;
    }

    function onPointerLeave() {
      if (grid.isSignalMode) {
        grid.targetOpacity = 0.2;
      } else if (!grid.targetFullPage) {
        grid.targetOpacity = 0;
      }
      grid.targetWarp = 0;
    }

    function onPointerDown(event: PointerEvent) {
      updatePointer(event);
      if (grid.targetFullPage) return;
      grid.targetWarp = grid.isSignalMode ? 0.45 : 1;
    }

    const interactiveControls = document.querySelectorAll<HTMLElement>(".links a, .section-jump");
    interactiveControls.forEach((control) => {
      control.addEventListener("pointerenter", updatePointer as EventListener, { passive: true });
      control.addEventListener("pointerenter", shrinkGridReveal);
      control.addEventListener("pointerleave", expandGridReveal);
      control.addEventListener("focus", shrinkGridReveal);
      control.addEventListener("blur", expandGridReveal);
    });

    const applyPanel = document.querySelector<HTMLElement>("#apply-panel");
    function onPanelPointerMove(event: PointerEvent) {
      panelGridHover = true;
      updatePointer(event);
      grid.targetBaseAlpha = Math.max(grid.signalProgress * 0.28, 0.3);
      grid.targetRevealScale = 1;
    }
    function onPanelEnter(event: PointerEvent) {
      panelGridHover = true;
      updatePointer(event);
      grid.targetBaseAlpha = Math.max(grid.signalProgress * 0.28, 0.3);
      grid.targetRevealScale = 1;
      grid.targetOpacity = grid.isSignalMode ? 0.68 : 0.72;
    }
    function onPanelLeave() {
      panelGridHover = false;
      grid.targetBaseAlpha = grid.signalProgress * 0.28;
      grid.targetOpacity = grid.isSignalMode ? 0.2 : 0;
    }
    applyPanel?.addEventListener("pointermove", onPanelPointerMove as EventListener, { passive: true });
    applyPanel?.addEventListener("pointerenter", onPanelEnter as EventListener);
    applyPanel?.addEventListener("pointerleave", onPanelLeave);

    let observer: IntersectionObserver | null = null;
    if (pages.length) {
      observer = new IntersectionObserver(
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
          if (index >= 0) {
            activePageIndex = Math.max(0, Math.min(index, pages.length - 1));
            syncGridMode();
          }
        },
        { threshold: [0.35, 0.6, 0.85] },
      );
      pages.forEach((page) => observer!.observe(page));
    }

    window.addEventListener("resize", resizeGrid);
    window.addEventListener("pointermove", updatePointer as EventListener, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerdown", onPointerDown as EventListener, { passive: true });
    window.addEventListener("pointerup", releaseGridWarp, { passive: true });
    window.addEventListener("pointercancel", releaseGridWarp, { passive: true });
    window.addEventListener("blur", releaseGridWarp);

    resizeGrid();
    syncGridMode();
    drawGrid();

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resizeGrid);
      window.removeEventListener("pointermove", updatePointer as EventListener);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerdown", onPointerDown as EventListener);
      window.removeEventListener("pointerup", releaseGridWarp);
      window.removeEventListener("pointercancel", releaseGridWarp);
      window.removeEventListener("blur", releaseGridWarp);
      interactiveControls.forEach((control) => {
        control.removeEventListener("pointerenter", updatePointer as EventListener);
        control.removeEventListener("pointerenter", shrinkGridReveal);
        control.removeEventListener("pointerleave", expandGridReveal);
        control.removeEventListener("focus", shrinkGridReveal);
        control.removeEventListener("blur", expandGridReveal);
      });
      applyPanel?.removeEventListener("pointermove", onPanelPointerMove as EventListener);
      applyPanel?.removeEventListener("pointerenter", onPanelEnter as EventListener);
      applyPanel?.removeEventListener("pointerleave", onPanelLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-grid" aria-hidden="true" />;
}
