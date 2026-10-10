// Small timing helpers, ported from the original matplotlib animation.

export const clip01 = (x: number) => Math.min(1, Math.max(0, x));

export const prog = (t: number, t0: number, dur: number) =>
    dur > 0 ? clip01((t - t0) / dur) : (t >= t0 ? 1 : 0);

export const ease = (x: number) => {
    x = clip01(x);
    return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
};

export const easeOut = (x: number) => 1 - (1 - clip01(x)) ** 3;

export const backOut = (x: number) => {
    x = clip01(x);
    const c1 = 1.70158;
    return 1 + (c1 + 1) * (x - 1) ** 3 + c1 * (x - 1) ** 2;
};

export const lerp = (a: number, b: number, s: number) => a + (b - a) * s;

// Deterministic pseudo-random number in [-1, 1] for a given (seed, salt) pair.
export function jitter(seed: number, salt: number): number {
    const x = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1;
}
