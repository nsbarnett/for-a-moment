export type RetroOptions = {
  text: string;
  fontSize: number;      // in CSS pixels (screen pixels)
  pixelScale: number;    // chunkiness (2..10)
  rgbOffset: number;     // channel shift in CSS pixels (0..6)
  scanlineAlpha: number; // 0..1
  maskAlpha: number;     // 0..1 (RGB stripe mask strength)
  flicker: number;       // 0..1
  background: string;    // css color
  fontFamily?: string;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const idx = (x: number, y: number, width: number) => (y * width + x) * 4;

function cssToRgb(css: string): [number, number, number] {
  // Browser parses CSS color -> computed rgb()
  const t = document.createElement("div");
  t.style.color = css;
  document.body.appendChild(t);
  const rgb = getComputedStyle(t).color; // e.g. "rgb(11, 11, 11)"
  t.remove();
  const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

export function renderRetro(
  canvas: HTMLCanvasElement,
  dpr: number,
  opts: Partial<RetroOptions> = {}
) {
  const o: RetroOptions = {
    text: "RETRO DISPLAY",
    fontSize: 72,
    pixelScale: 3,
    rgbOffset: 2,
    scanlineAlpha: 0.22,
    maskAlpha: 0.22,
    flicker: 0.08,
    background: "#0b0b0b",
    ...opts,
  };

  const ctx = canvas.getContext("2d", { alpha: false })!;
  const w = canvas.width;
  const h = canvas.height;

  const [bgR, bgG, bgB] = cssToRgb(o.background);

  // Lower-res offscreen for chunky pixels
  const lowW = Math.max(1, Math.floor(w / o.pixelScale));
  const lowH = Math.max(1, Math.floor(h / o.pixelScale));

  const off = document.createElement("canvas");
  off.width = lowW;
  off.height = lowH;
  const offCtx = off.getContext("2d", { alpha: true })!;

  // Clear
  ctx.fillStyle = o.background;
  ctx.fillRect(0, 0, w, h);

  offCtx.clearRect(0, 0, lowW, lowH);

  // If Fixedsys isn't loaded, falls back to monospace.
  const lowFontSize = Math.max(6, Math.floor(o.fontSize / o.pixelScale));
  const fontFamily =
  o.fontFamily ?? `"Fixedsys Excelsior","Fixedsys",monospace`;

  offCtx.font = `${lowFontSize}px ${fontFamily}`;

  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";

  // Small glow for phosphor bleed
  offCtx.shadowColor = "rgba(255,255,255,0.25)";
  offCtx.shadowBlur = 0;

  offCtx.fillStyle = "#e8e7e6";
  offCtx.fillText(o.text, lowW / 2, lowH / 2);

  const src = offCtx.getImageData(0, 0, lowW, lowH);
  const s = src.data;

  const out = ctx.createImageData(w, h);
  const d = out.data;

  // rgbOffset in low-res pixel units
  const rgbOffLow = Math.max(0, Math.floor((o.rgbOffset * dpr) / o.pixelScale));

  // Flicker multiplier per frame
  const flick = 1 + (Math.random() * 2 - 1) * o.flicker;

  for (let y = 0; y < h; y++) {
    const sy = Math.floor(y / o.pixelScale);

    for (let x = 0; x < w; x++) {
      const sx = Math.floor(x / o.pixelScale);

      const base = idx(sx, sy, lowW);

      const rx = clamp(sx - rgbOffLow, 0, lowW - 1);
      const gx = sx;
      const bx = clamp(sx + rgbOffLow, 0, lowW - 1);

      const rI = idx(rx, sy, lowW);
      const gI = base;
      const bI = idx(bx, sy, lowW);

      const a = s[base + 3] / 255;

      let outR = bgR, outG = bgG, outB = bgB;

      if (a > 0.01) {
        const r = s[rI] * flick;
        const g = s[gI + 1] * flick;
        const b = s[bI + 2] * flick;

        outR = clamp(bgR + r * 0.85, 0, 255);
        outG = clamp(bgG + g * 0.85, 0, 255);
        outB = clamp(bgB + b * 0.85, 0, 255);

        // RGB subpixel mask
        const stripe = x % 3; // 0=R,1=G,2=B
        const m = o.maskAlpha;

        if (stripe === 0) { outG *= (1 - m); outB *= (1 - m); }
        if (stripe === 1) { outR *= (1 - m); outB *= (1 - m); }
        if (stripe === 2) { outR *= (1 - m); outG *= (1 - m); }
      }

      const oi = idx(x, y, w);
      d[oi] = outR;
      d[oi + 1] = outG;
      d[oi + 2] = outB;
      d[oi + 3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);

  // Scanlines overlay
  if (o.scanlineAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = o.scanlineAlpha;
    ctx.fillStyle = "#000";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    ctx.restore();
  }
}
