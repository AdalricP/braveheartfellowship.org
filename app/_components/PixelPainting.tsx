"use client";

import { useEffect, useRef } from "react";

/**
 * A framed Renaissance painting that, on hover, dissolves into a grid of
 * pixels: every cell shrinks and drifts outward, the disturbance strongest
 * under the cursor. At rest it renders the crisp painting.
 */

// Crop the fresco scene out of the source image (trims the wall edges and the
// grisaille panels along the bottom of the original photograph).
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
      hover: 0, // eased 0 → 1
      targetHover: 0,
      px: -9999, // pointer in CSS px relative to canvas
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

    // Source crop in natural pixels — set once the image dimensions are known.
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

      // Aim for ~11px cells, keep them roughly square.
      state.cols = Math.max(24, Math.round(state.displayW / 11));
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

    function draw() {
      const w = state.displayW;
      const h = state.displayH;
      ctx!.clearRect(0, 0, w, h);

      // Ease toward targets.
      state.hover += (state.targetHover - state.hover) * 0.1;
      state.easedPx += (state.px - state.easedPx) * 0.18;
      state.easedPy += (state.py - state.easedPy) * 0.18;
      const g = state.hover;

      if (state.ready && img.naturalWidth) {
        // Crisp painting, fading out as the dissolve takes over.
        const imgAlpha = Math.max(0, 1 - g * 1.85);
        if (imgAlpha > 0.001) {
          ctx!.globalAlpha = imgAlpha;
          ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        }
      }

      if (colors && g > 0.003) {
        const { cols, rows, cellW, cellH } = state;
        const base = Math.min(cellW, cellH);
        const sigma = w * 0.2;
        const twoSigmaSq = 2 * sigma * sigma;
        const cellAlpha = Math.min(1, g * 1.7);
        const centerX = w / 2;
        const centerY = h / 2;

        ctx!.globalAlpha = cellAlpha;
        for (let r = 0; r < rows; r += 1) {
          const cy = (r + 0.5) * cellH;
          for (let c = 0; c < cols; c += 1) {
            const cx = (c + 0.5) * cellW;
            const i = (r * cols + c) * 4;
            const cr = colors[i];
            const cg = colors[i + 1];
            const cb = colors[i + 2];

            const dx = cx - state.easedPx;
            const dy = cy - state.easedPy;
            const distSq = dx * dx + dy * dy;
            const prox = Math.exp(-distSq / twoSigmaSq); // 0 → 1 near cursor

            // Each pixel shrinks: uniform with hover, extra near the cursor.
            const shrink = Math.min(0.94, 0.5 * g + 0.46 * prox * g);
            const size = base * (1 - shrink);
            if (size < 0.35) continue;

            // Spread: a gentle global push outward from the centre, plus a
            // stronger shove away from the cursor.
            let ox = (cx - centerX) * 0.06 * g;
            let oy = (cy - centerY) * 0.06 * g;
            const plen = Math.sqrt(distSq) || 1;
            const push = prox * g * 30;
            ox += (dx / plen) * push;
            oy += (dy / plen) * push;

            ctx!.fillStyle = `rgb(${cr},${cg},${cb})`;
            ctx!.fillRect(cx + ox - size / 2, cy + oy - size / 2, size, size);
          }
        }
      }

      ctx!.globalAlpha = 1;
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
      state.px = -9999;
      state.py = -9999;
    };

    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);

    const ro = new ResizeObserver(() => layout());
    ro.observe(canvas);

    img.onload = () => {
      layout();
    };
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
        <canvas ref={canvasRef} aria-label="The School of Athens by Raphael — hover to dissolve into pixels" />
      </div>
      <figcaption className="placard">
        <span className="work">The School of Athens</span>
        <span className="meta">Raffaello Sanzio · 1511</span>
        <span className="hint">hover to disturb</span>
      </figcaption>
    </figure>
  );
}
