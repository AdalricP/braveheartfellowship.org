"use client";

import { useEffect, useRef } from "react";

/**
 * A framed Renaissance painting. It stays crisp; only a small region around
 * the cursor breaks into pixels — the dots shrink and drift a little, and the
 * effect falls off quickly outside a tight radius.
 */

// Crop the fresco scene out of the source image.
const CROP = { x: 0.02, y: 0.025, w: 0.96, h: 0.7 };
const ASPECT = (0.96 * 1920) / (0.7 * 1490); // ≈ 1.77

export default function PixelPainting() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = {
      hover: 0,
      targetHover: 0,
      px: -9999,
      py: -9999,
      easedPx: -9999,
      easedPy: -9999,
      displayW: 0,
      displayH: 0,
      cols: 0,
      rows: 0,
      cellW: 0,
      cellH: 0,
      ready: false,
    };

    let colors: Uint8ClampedArray | null = null;
    let frame = 0;

    const img = new Image();
    img.decoding = "async";
    img.src = "/assets/painting.jpg";

    let sx = 0;
    let sy = 0;
    let sw = 0;
    let sh = 0;

    function sampleColors() {
      if (!img.naturalWidth) return;
      const sample = document.createElement("canvas");
      sample.width = state.cols;
      sample.height = state.rows;
      const sctx = sample.getContext("2d");
      if (!sctx) return;
      sctx.drawImage(img, sx, sy, sw, sh, 0, 0, state.cols, state.rows);
      colors = sctx.getImageData(0, 0, state.cols, state.rows).data;
    }

    function layout() {
      const cssWidth = canvas.clientWidth || canvas.parentElement?.clientWidth || 600;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.displayW = cssWidth;
      state.displayH = Math.round(cssWidth / ASPECT);
      canvas.style.height = `${state.displayH}px`;
      canvas.width = Math.round(state.displayW * dpr);
      canvas.height = Math.round(state.displayH * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      state.cols = Math.max(24, Math.round(state.displayW / 12));
      state.cellW = state.displayW / state.cols;
      state.rows = Math.max(14, Math.round(state.displayH / state.cellW));
      state.cellH = state.displayH / state.rows;

      if (img.naturalWidth) {
        sx = img.naturalWidth * CROP.x;
        sy = img.naturalHeight * CROP.y;
        sw = img.naturalWidth * CROP.w;
        sh = img.naturalHeight * CROP.h;
        sampleColors();
        state.ready = true;
      }
    }

    // Tuning — kept gentle and local.
    const SHRINK_MAX = 0.46; // dots never shrink past ~half size
    const SPREAD_MAX = 6; // px of drift, max

    function draw() {
      const w = state.displayW;
      const h = state.displayH;
      ctx!.clearRect(0, 0, w, h);

      state.hover += (state.targetHover - state.hover) * 0.14;
      state.easedPx += (state.px - state.easedPx) * 0.24;
      state.easedPy += (state.py - state.easedPy) * 0.24;
      const g = state.hover;

      // The painting is always crisp.
      if (state.ready && img.naturalWidth) {
        ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      }

      if (colors && g > 0.005) {
        const { cols, rows, cellW, cellH } = state;
        const base = Math.min(cellW, cellH);
        const radius = Math.min(w, h) * 0.17; // the "specific radius"
        const sigma = radius * 0.55; // tight → quick falloff
        const twoSigmaSq = 2 * sigma * sigma;
        const cutoff = radius * 1.7;
        const cutoffSq = cutoff * cutoff;
        const px = state.easedPx;
        const py = state.easedPy;

        for (let r = 0; r < rows; r += 1) {
          const cy = (r + 0.5) * cellH;
          if (Math.abs(cy - py) > cutoff) continue;
          for (let c = 0; c < cols; c += 1) {
            const cx = (c + 0.5) * cellW;
            const dx = cx - px;
            const dy = cy - py;
            const distSq = dx * dx + dy * dy;
            if (distSq > cutoffSq) continue;

            const prox = Math.exp(-distSq / twoSigmaSq);
            const i = prox * g;
            if (i < 0.03) continue;

            // Erase the cell toward white, proportional to intensity.
            ctx!.globalAlpha = i;
            ctx!.fillStyle = "#ffffff";
            ctx!.fillRect(cx - cellW / 2 - 0.5, cy - cellH / 2 - 0.5, cellW + 1, cellH + 1);

            // Draw the shrunken, slightly drifted colour dot.
            const size = base * (1 - SHRINK_MAX * i);
            const plen = Math.sqrt(distSq) || 1;
            const off = i * SPREAD_MAX;
            const ox = (dx / plen) * off;
            const oy = (dy / plen) * off;
            const idx = (r * cols + c) * 4;
            ctx!.globalAlpha = i;
            ctx!.fillStyle = `rgb(${colors[idx]},${colors[idx + 1]},${colors[idx + 2]})`;
            ctx!.fillRect(cx + ox - size / 2, cy + oy - size / 2, size, size);
          }
        }
        ctx!.globalAlpha = 1;
      }

      frame = requestAnimationFrame(draw);
    }

    function setPointer(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      state.px = e.clientX - rect.left;
      state.py = e.clientY - rect.top;
    }

    const onEnter = (e: PointerEvent) => {
      setPointer(e);
      state.easedPx = state.px;
      state.easedPy = state.py;
      state.targetHover = 1;
    };
    const onMove = (e: PointerEvent) => {
      setPointer(e);
      state.targetHover = 1;
    };
    const onLeave = () => {
      state.targetHover = 0;
    };

    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);

    const ro = new ResizeObserver(() => layout());
    ro.observe(canvas);

    img.onload = () => layout();
    if (img.complete) layout();
    draw();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
      img.onload = null;
    };
  }, []);

  return (
    <figure className="frame-figure">
      <div className="frame">
        <canvas ref={canvasRef} aria-label="The School of Athens by Raphael" />
      </div>
      <figcaption className="caption">Raphael, The School of Athens</figcaption>
    </figure>
  );
}
