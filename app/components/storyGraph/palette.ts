// Colors of the landing story animation, in the style of the original RxInfer landing graph.
export const BG = '#ffffff';
export const INK = '#0aa8a7';
export const INK_DARK = '#087f7e';
export const FACTOR_FILL = '#f5f7f7';
export const GOAL = '#fd7e14';
export const DATA = '#0b6e6d';

// Every variable gets its own colour, like the distributions on the old landing graph. Its belief
// and the messages travelling over its edges share that colour.
export const VAR_COLORS: Record<string, string> = {
    th: '#6f42c1', x0: '#e83e8c', x1: '#17a2b8', x2: '#dc3545', x3: '#007bff', x4: '#28a745',
    u1: '#fd7e14', u2: '#fd7e14', u3: '#fd7e14', u4: '#fd7e14',
    y1: '#0b6e6d', y2: '#0b6e6d', y3: '#0b6e6d', y4: '#0b6e6d',
};
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
