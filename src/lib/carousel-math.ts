/** Pure maths for the variant carousel, kept free of DOM so it can be unit tested. */

export function wrapIndex(i: number, n: number): number {
  return ((i % n) + n) % n;
}

/**
 * Distance of slide `i` from the current (fractional) position.
 * In loop mode the result is folded into [-n/2, n/2) so every slide takes
 * the short way round.
 */
export function slideDistance(i: number, pos: number, n: number, loop: boolean): number {
  const d = i - pos;
  if (!loop) return d;
  return wrapIndex(d + n / 2, n) - n / 2;
}

/** Signed step count from `from` to `to` that travels the shortest way. */
export function shortestDelta(from: number, to: number, n: number, loop: boolean): number {
  const d = to - from;
  if (!loop) return d;
  return wrapIndex(d + n / 2, n) - n / 2;
}

export function nearestIndex(pos: number, n: number, loop: boolean): number {
  const r = Math.round(pos);
  return loop ? wrapIndex(r, n) : Math.min(n - 1, Math.max(0, r));
}

export interface DepthOptions {
  /** Horizontal gap between neighbouring slide centres, in px. */
  spacing: number;
  /** How many slides on each side stay visible. */
  radius: number;
  /** Maximum blur in px for the furthest visible slide. */
  maxBlur: number;
}

export interface SlideDepth {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
  visible: boolean;
}

/**
 * Turns a slide's distance from centre into its transform.
 * Spacing tightens with distance so the row reads as receding into depth,
 * not as a flat strip.
 */
export function slideDepth(d: number, { spacing, radius, maxBlur }: DepthOptions): SlideDepth {
  const a = Math.abs(d);
  const sign = Math.sign(d);
  // Each step away from centre covers a little less ground than the last.
  const travel = a <= 1 ? a : 1 + (a - 1) * 0.82;
  const fade = Math.max(0, Math.min(1, radius + 0.6 - a));
  return {
    x: sign * travel * spacing,
    y: Math.min(a, radius + 1) * -6,
    scale: Math.max(0.55, 1 - 0.13 * a),
    opacity: Math.min(1, (1 - 0.16 * Math.min(a, radius)) * fade),
    blur: Math.min(maxBlur, (Math.max(0, a - 0.35) / Math.max(1, radius)) * maxBlur),
    zIndex: 100 - Math.round(a * 10),
    visible: fade > 0,
  };
}
