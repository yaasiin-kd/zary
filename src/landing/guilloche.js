// Engraved banknote-style line patterns, shared by the SVG art and the 3D texture.
export function ringD(cx, cy, R, k, amp, ph) {
  let d = '';
  for (let j = 0; j <= 480; j++) {
    const t = (j / 480) * Math.PI * 2;
    const r = R + amp * Math.sin(k * t + ph);
    d += (j ? 'L' : 'M') + (cx + r * Math.cos(t)).toFixed(1) + ' ' + (cy + r * Math.sin(t)).toFixed(1);
  }
  return d + 'Z';
}

export function waveD(width, y, amp, per, ph) {
  let d = '';
  for (let x = 0; x <= width; x += 4) d += (x ? 'L' : 'M') + x + ' ' + (y + amp * Math.sin(x / per + ph)).toFixed(1);
  return d;
}

export const rings = (cx, cy, base, count, step, k, amp, stroke, w) =>
  Array.from({ length: count }, (_, i) => ({ d: ringD(cx, cy, base + i * step, k, amp, i * 0.5), stroke, w }));

export const waves = (width, y0, count, gap, amp, per, stroke, w) =>
  Array.from({ length: count }, (_, i) => ({ d: waveD(width, y0 + i * gap, amp, per, i * 0.45), stroke, w }));

export const NOTE_LINES = [
  ...rings(440, 140, 34, 15, 7, 14, 5, 'rgba(255,255,255,.2)', 0.8),
  ...rings(440, 140, 14, 6, 3.5, 9, 3, 'rgba(255,255,255,.28)', 0.7),
  ...waves(560, 208, 9, 5, 6, 22, 'rgba(255,255,255,.13)', 0.7),
];
export const CTA_RINGS = rings(1010, 210, 40, 22, 9, 18, 7, 'rgba(255,255,255,.12)', 0.9);
export const CTA_RINGS_INNER = rings(1010, 210, 14, 8, 4, 11, 3, 'rgba(255,255,255,.18)', 0.8);
export const CTA_WAVES = waves(1200, 300, 14, 6, 9, 40, 'rgba(255,255,255,.08)', 0.8);
