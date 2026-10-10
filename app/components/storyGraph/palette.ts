// Colors of the landing story animation. Ink is the RxInfer brand teal, the accents keep
// the semantic roles of the original BIASlab animation (messages, beliefs, goals/actions).
export const BG = '#ffffff';
export const INK = '#0aa8a7';
export const INK_DARK = '#087f7e';
export const MSG = '#dc3545';
export const BELIEF = '#2f6fde';
export const GOAL = '#fd7e14';
export const MUTED = '#6b7b8c';
export const FAINT = '#c9d6da';
export const WORLD = '#eef5f5';
export const WHITE = '#ffffff';

function rgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Linear mix of two hex colors, returned as a css rgb() string.
export function mix(c1: string, c2: string, k: number): string {
    const a = rgb(c1), b = rgb(c2);
    const t = Math.min(1, Math.max(0, k));
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
}
