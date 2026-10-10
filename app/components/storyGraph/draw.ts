// Canvas rendering of one frame of the story. Everything here is a pure function of the
// frame state (story position, idle clocks), ported from the original matplotlib script.

import { backOut, clip01, ease, easeOut, lerp, prog } from './engine';
import { Layout, TERMS, T } from './geometry';
import {
    AI, GraphSched, MP, SEG12, SEG23, SETTLED, VAGUE, Track, BState,
    beliefAt, nowPosition,
} from './choreography';
import { BELIEF, FAINT, GOAL, INK, MUTED, WHITE, WORLD, mix } from './palette';

export interface Scheds { seg01: GraphSched; intro: GraphSched; mp: MP; ai: AI }

export interface Rect { cx: number; cy: number; w: number; h: number }

export interface Frame {
    p: number;
    introT: number;
    idle2: number;
    idle3: number;
    font: string;
    homes: Rect[] | null;        // home boxes of the equation terms, in scene coordinates
}

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

// ------------------------------------------------------------------ frame-derived quantities
export const idleWeight = (p: number, stop: number) => 1 - ease(clip01(Math.abs(p - stop) / 0.3));

function loop(track: Track, t: number) {
    const cycle = Math.floor(t / track.cycle);
    return { lt: t - cycle * track.cycle, cycle };
}

export function graphPhase(S: Scheds, F: Frame) {
    if (F.p < 1) return { g: S.seg01, tau: F.p * S.seg01.dur, pop: false };
    return { g: S.intro, tau: F.introT, pop: true };
}

// Opacity of the equation decorations (left-hand side, multiplication signs, posterior).
export const equationAlpha = (S: Scheds, F: Frame) =>
    F.p >= 1 ? 0 : 1 - ease(prog(F.p * S.seg01.dur, 0.15, 0.4));

export interface Flight { x: number; y: number; w: number; h: number; k: number; outline: number; textAlpha: number; scale: number }

// Position of equation term i while it flies into its factor node (null when not visible).
export function termFlight(i: number, L: Layout, S: Scheds, F: Frame): Flight | null {
    if (F.p >= 1 || !F.homes) return null;
    const tau = F.p * S.seg01.dur;
    const fl = S.seg01.flights[i];
    const k = ease(prog(tau, fl.f0, fl.f1 - fl.f0));
    if (k >= 1) return null;
    const home = F.homes[i];
    const node = L.nodes[TERMS[i].node];
    const { cx, cy } = home;
    const mx = (cx + node.x) / 2, my = (cy + node.y) / 2;
    const dx = node.x - cx, dy = node.y - cy;
    const ctrl: Pt = [mx - dy * 0.12, my + dx * 0.12];
    const x = (1 - k) ** 2 * cx + 2 * (1 - k) * k * ctrl[0] + k ** 2 * node.x;
    const y = (1 - k) ** 2 * cy + 2 * (1 - k) * k * ctrl[1] + k ** 2 * node.y;
    return {
        x, y, k,
        w: lerp(home.w + 14 * L.U, node.size, k),
        h: lerp(home.h + 16 * L.U, node.size, k),
        outline: ease(prog(tau, 0.02 * i, 0.3)),
        textAlpha: 1 - ease(prog(k, 0, 0.55)),
        scale: lerp(1, 0.55, k),
    };
}

export function edgeLabelAlpha(S: Scheds, F: Frame, edgeIndex: number) {
    const { g, tau } = graphPhase(S, F);
    return prog(tau, g.edges[edgeIndex].g1 + 0.05, 0.3);
}

// ------------------------------------------------------------------ primitives
function rbox(ctx: Ctx, cx: number, cy: number, w: number, h: number, r: number,
    fc: string | null, ec: string | null, lw: number, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
    if (fc) { ctx.fillStyle = fc; ctx.fill(); }
    if (ec) { ctx.strokeStyle = ec; ctx.lineWidth = lw; ctx.stroke(); }
    ctx.globalAlpha = 1;
}

function dot(ctx: Ctx, p: Pt, r: number, color: string, alpha: number) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function line(ctx: Ctx, a: Pt, b: Pt, color: string, lw: number, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function arrow(ctx: Ctx, a: Pt, b: Pt, color: string, alpha: number, U: number) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (alpha <= 0 || len < 2) return;
    const u: Pt = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    const n: Pt = [-u[1], u[0]];
    const hl = 16 * U, hw = 9 * U;
    line(ctx, a, [b[0] - u[0] * hl * 0.8, b[1] - u[1] * hl * 0.8], color, 3 * U, alpha);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(b[0] - u[0] * hl + n[0] * hw, b[1] - u[1] * hl + n[1] * hw);
    ctx.lineTo(b[0] - u[0] * hl - n[0] * hw, b[1] - u[1] * hl - n[1] * hw);
    ctx.lineTo(b[0], b[1]);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
}

function text(ctx: Ctx, s: string, p: Pt, opts: {
    size: number; color: string; alpha: number; font: string;
    align?: CanvasTextAlign; weight?: string; italic?: boolean; rotate?: boolean;
}) {
    if (opts.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = opts.alpha;
    ctx.fillStyle = opts.color;
    ctx.font = `${opts.italic ? 'italic ' : ''}${opts.weight ?? '400'} ${opts.size}px ${opts.font}`;
    ctx.textAlign = opts.align ?? 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(p[0], p[1]);
    if (opts.rotate) ctx.rotate(-Math.PI / 2);
    ctx.fillText(s, 0, 0);
    ctx.restore();
}

// ------------------------------------------------------------------ flashes
function flashLevel(name: string, L: Layout, S: Scheds, F: Frame, w2: number, w3: number) {
    let best = 0, col = INK;
    const consider = (tf: number, now: number, color: string, weight: number) => {
        const d = now - tf;
        if (weight <= 0 || d < 0 || d >= 0.5) return;
        const f = weight * (1 - d / 0.5) ** 2;
        if (f > best) { best = f; col = color; }
    };
    const { g, tau } = graphPhase(S, F);
    if (g.appear[name] !== undefined) consider(g.appear[name], tau, INK, 1);
    if (F.p > 1 && F.p < 2) {
        const t12 = (F.p - 1) * SEG12.dur;
        for (const o of SEG12.obs) if (o.node === name) consider(o.t0 + SEG12.obsDur, t12, INK, 1);
    }
    const tracks: [Track, number, number][] = [[S.mp.track, F.idle2, w2], [S.ai.track, F.idle3, w3]];
    for (const [tr, t, w] of tracks) {
        if (w <= 0) continue;
        const { lt, cycle } = loop(tr, t);
        for (const fl of tr.flashes[name] ?? []) {
            if (fl.repeat && cycle === 0) continue;
            consider(fl.t, lt, fl.color, w);
        }
    }
    return { f: best, col };
}

// ------------------------------------------------------------------ scene parts
function drawWorld(ctx: Ctx, L: Layout, F: Frame) {
    const a = F.p <= 1 ? 0 : F.p >= 2 ? 1 : ease(prog((F.p - 1) * SEG12.dur, 0, 0.6));
    if (a <= 0) return;
    const off = (1 - a) * 50;
    const [x0, y0] = L.map(-200, L.dWorld + off);
    const [x1, y1] = L.map(L.sMax + 200, L.dMax + 200);
    ctx.globalAlpha = a;
    ctx.fillStyle = WORLD;
    ctx.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
    ctx.globalAlpha = 1;
    line(ctx, L.map(-200, L.dWorld + off), L.map(L.sMax + 200, L.dWorld + off), FAINT, 1.5 * L.U, a);
    const mid = (L.dWorld + L.dMax) / 2 + off;
    text(ctx, 'world', L.mobile ? L.map(L.sMax - 90, mid) : L.map(L.sMax - 40, mid),
        { size: 24 * L.U, color: MUTED, alpha: a, font: F.font, italic: true, align: L.mobile ? 'center' : 'right', rotate: L.mobile });
}

function drawNow(ctx: Ctx, L: Layout, S: Scheds, F: Frame, w3: number) {
    if (F.p <= 2) return;
    const t23 = (F.p - 2) * SEG23.dur;
    const a = F.p >= 3 ? 1 : ease(prog(t23, 0, 0.5));
    let s = F.p >= 3 ? L.nowS[0] : lerp(L.sMax, L.nowS[0], ease(prog(t23, 0, 0.9)));
    if (w3 > 0) s = lerp(s, nowPosition(L, S.ai, loop(S.ai.track, F.idle3).lt), w3);
    const [d0, d1] = L.region;
    const [ax, ay] = L.map(s, d0);
    const [bx, by] = L.map(L.sMax - 30, d1);
    ctx.globalAlpha = 0.075 * a;
    ctx.fillStyle = GOAL;
    ctx.beginPath();
    ctx.roundRect(Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax), Math.abs(by - ay), 18 * L.U);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.setLineDash([5 * L.U, 5 * L.U]);
    line(ctx, L.map(s, d0), L.map(s, d1), GOAL, 2 * L.U, 0.9 * a);
    ctx.setLineDash([]);
    text(ctx, 'now', L.map(s, d0 - (L.mobile ? 45 : 22)),
        { size: 24 * L.U, color: mix(GOAL, '#101073', 0.25), alpha: a, font: F.font, weight: '700' });
}

function drawEdges(ctx: Ctx, L: Layout, S: Scheds, F: Frame) {
    const { g, tau } = graphPhase(S, F);
    L.edges.forEach((e, i) => {
        const sch = g.edges[i];
        const k = easeOut(prog(tau, sch.g0, sch.g1 - sch.g0));
        if (k <= 0) return;
        const na = L.nodes[sch.fromA ? e.a : e.b], nb = L.nodes[sch.fromA ? e.b : e.a];
        const p0: Pt = [na.x, na.y], p1: Pt = [nb.x, nb.y];
        const at = (r: number): Pt => [p0[0] + (p1[0] - p0[0]) * r, p0[1] + (p1[1] - p0[1]) * r];
        if (!e.dangling) {
            line(ctx, p0, at(k), INK, 3.2 * L.U);
            return;
        }
        // solid start, then fading out into the future
        const q = at(Math.min(k, 0.25));
        line(ctx, p0, q, INK, 3.2 * L.U);
        if (k > 0.25) {
            const end = at(k), full = at(1);
            const grad = ctx.createLinearGradient(q[0], q[1], full[0], full[1]);
            grad.addColorStop(0, INK);
            grad.addColorStop(1, 'rgba(10,168,167,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 3.2 * L.U;
            ctx.beginPath();
            ctx.moveTo(q[0], q[1]);
            ctx.lineTo(end[0], end[1]);
            ctx.stroke();
        }
    });
}

function drawMsgs(ctx: Ctx, L: Layout, tr: Track, t: number, w: number) {
    if (w <= 0) return;
    const { lt } = loop(tr, t);
    const TR = 140;
    for (const m of tr.msgs) {
        const d = (lt - m.t0) * m.v;
        if (d <= 0 || d - TR >= m.L) continue;
        const head = Math.min(d, m.L), tail = Math.max(0, d - TR);
        if (head - tail < 1) continue;
        const a = L.nodes[m.a], b = L.nodes[m.b];
        const u: Pt = [(b.x - a.x) / m.L, (b.y - a.y) / m.L];
        const n: Pt = [-u[1], u[0]];
        const fade = m.fade ? (1 - head / m.L) ** 0.8 : 1;
        // tapered tail: one translucent wedge, widest at the head
        const N = 16, left: Pt[] = [], right: Pt[] = [];
        for (let j = 0; j <= N; j++) {
            const s = tail + (head - tail) * j / N;
            const r = clip01((s - (d - TR)) / TR);
            const hw = 5.5 * L.U * r ** 1.2;
            const px = a.x + u[0] * s, py = a.y + u[1] * s;
            left.push([px + n[0] * hw, py + n[1] * hw]);
            right.push([px - n[0] * hw, py - n[1] * hw]);
        }
        ctx.globalAlpha = 0.55 * fade * w;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        left.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        for (let j = right.length - 1; j >= 0; j--) ctx.lineTo(right[j][0], right[j][1]);
        ctx.closePath();
        ctx.fill();
        if (d <= m.L) {
            const hp: Pt = [a.x + u[0] * head, a.y + u[1] * head];
            dot(ctx, hp, 27 * L.U, m.color, 0.10 * fade * w);
            dot(ctx, hp, 16 * L.U, m.color, 0.22 * fade * w);
            dot(ctx, hp, 9 * L.U, m.color, fade * w);
        }
    }
    ctx.globalAlpha = 1;
}

function riserDot(ctx: Ctx, L: Layout, s: number, k: number, alpha: number) {
    if (k <= 0 || k >= 1 || alpha <= 0) return;
    const p = L.map(s, lerp(L.dWorld + 50, L.dY + 12, ease(k)));
    dot(ctx, p, 16 * L.U, INK, 0.12 * alpha);
    dot(ctx, p, 8.5 * L.U, INK, alpha);
}

function ioLabel(ctx: Ctx, L: Layout, F: Frame, s: string, sPos: number, side: -1 | 1, color: string, alpha: number) {
    if (L.mobile) {
        text(ctx, s, L.map(sPos + side * 80, (L.dWorld + L.dMax) / 2),
            { size: 22 * L.U, color, alpha, font: F.font, italic: true, rotate: true });
    } else {
        text(ctx, s, L.map(sPos + side * 18, L.dWorld - 38),
            { size: 24, color, alpha, font: F.font, italic: true, align: side < 0 ? 'right' : 'left' });
    }
}

function drawIO(ctx: Ctx, L: Layout, S: Scheds, F: Frame, w2: number, w3: number) {
    // data arriving while we move from the graph to message passing
    if (F.p > 1 && F.p < 2) {
        const t12 = (F.p - 1) * SEG12.dur;
        for (const o of SEG12.obs) {
            riserDot(ctx, L, sOf(L, o.node), prog(t12, o.t0, SEG12.obsDur), 1);
        }
    }
    if (w2 > 0) {
        const { lt, cycle } = loop(S.mp.track, F.idle2);
        if (cycle > 0) for (const r of S.mp.track.risers) riserDot(ctx, L, sOf(L, r.node), prog(lt, r.t0, r.t1 - r.t0), w2);
    }
    if (w3 > 0) {
        const { lt } = loop(S.ai.track, F.idle3);
        const gone = 1 - prog(lt, S.ai.reset, 0.5);
        for (const r of S.ai.track.risers) {
            const s = sOf(L, r.node);
            const k = prog(lt, r.t0, r.t1 - r.t0);
            if (k > 0 && r.label) {
                const al = (0.85 - 0.35 * prog(lt, r.t1 + 1.5, 1.0)) * gone * w3;
                arrow(ctx, L.map(s, L.dWorld - 4), L.map(s, lerp(L.dWorld - 4, L.dY + 22, easeOut(k))), INK, al, L.U);
                ioLabel(ctx, L, F, r.label, s, 1, INK_TEXT, al * prog(lt, r.t0, 0.4));
            }
            riserDot(ctx, L, s, k, w3);
        }
        for (const ac of S.ai.track.actions) {
            const d = (lt - ac.t0) * 520;
            if (d <= 0) continue;
            const s = sOf(L, ac.node);
            const y0 = L.dGU + 30;
            const al = (0.95 - 0.4 * prog(lt, ac.t0 + 2.0, 1.0)) * gone * w3;
            const y1 = lerp(y0, L.dWorld - 6, easeOut(clip01(d / (L.dWorld - 6 - y0))));
            arrow(ctx, L.map(s, y0), L.map(s, y1), GOAL, al, L.U);
            if (d < L.dWorld + 60 - y0) {
                const p = L.map(s, y0 + d);
                dot(ctx, p, 20 * L.U, GOAL, 0.12 * w3);
                dot(ctx, p, 12 * L.U, GOAL, 0.25 * w3);
                dot(ctx, p, 7 * L.U, GOAL, w3);
            }
            if (ac.label) ioLabel(ctx, L, F, ac.label, s, -1, mix(GOAL, '#101073', 0.3), al * prog(lt, ac.t0 + 0.1, 0.4));
        }
    }
}

const INK_TEXT = '#0b6e6d';

// story coordinate of a node
function sOf(L: Layout, name: string) {
    const n = L.nodes[name];
    return L.mobile ? n.y : n.x;
}

function mixState(a: BState, b: BState, w: number): BState {
    return { mu: lerp(a.mu, b.mu, w), sig: lerp(a.sig, b.sig, w) };
}

function drawBelief(ctx: Ctx, L: Layout, name: string, st: BState, color: string, a: number) {
    if (a <= 0) return;
    const an = L.anchors[name];
    const hw = an.hw * L.U;
    const amp = (27 * L.U) / st.sig ** 0.8;
    const N = 100;
    const xs: number[] = [], ys: number[] = [];
    for (let i = 0; i <= N; i++) {
        const u = -3 + 6 * i / N;
        xs.push(an.x + u * hw / 3);
        ys.push(an.y - amp * Math.exp(-0.5 * ((u - st.mu) / st.sig) ** 2) * a);
    }
    line(ctx, [xs[0], an.y], [xs[N], an.y], MUTED, 1.3 * L.U, 0.55 * a);
    ctx.beginPath();
    ctx.moveTo(xs[0], an.y);
    for (let i = 0; i <= N; i++) ctx.lineTo(xs[i], ys[i]);
    ctx.lineTo(xs[N], an.y);
    ctx.closePath();
    ctx.globalAlpha = 0.18 * a;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = a;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) (i ? ctx.lineTo(xs[i], ys[i]) : ctx.moveTo(xs[i], ys[i]));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6 * L.U;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawBeliefs(ctx: Ctx, L: Layout, S: Scheds, F: Frame, w2: number, w3: number) {
    const a = ease(prog(F.p, 1.55, 0.4));
    const l2 = loop(S.mp.track, F.idle2), l3 = loop(S.ai.track, F.idle3);
    const names = ['th', ...Array.from({ length: T }, (_, i) => `x${i + 1}`)];
    if (a > 0) names.forEach((name, salt) => {
        let st = F.p < 2 ? VAGUE[name] : SETTLED[name];
        if (w2 > 0) st = mixState(st, beliefAt(S.mp.track.ups[name], VAGUE[name], l2.lt, salt, l2.cycle), w2);
        if (w3 > 0) st = mixState(st, beliefAt(S.ai.track.ups[name], SETTLED[name], l3.lt, salt, 0), w3);
        drawBelief(ctx, L, name, st, BELIEF, a);
    });
    if (w3 > 0) for (const name of ['u3', 'u4'] as const) {
        const ua = w3 * ease(prog(l3.lt, S.ai.uAppear[name], 0.4)) * (1 - ease(prog(l3.lt, S.ai.reset, 0.8)));
        drawBelief(ctx, L, name, beliefAt(S.ai.track.ups[name], VAGUE[name], l3.lt, 0, 0), GOAL, ua);
    }
}

function drawNodes(ctx: Ctx, L: Layout, S: Scheds, F: Frame, w2: number, w3: number) {
    const { g, tau, pop } = graphPhase(S, F);
    for (const n of Object.values(L.nodes)) {
        if (n.kind !== 'factor' && n.kind !== 'equal') continue;
        if (tau < g.appear[n.name]) continue;
        const s = n.kind === 'equal' || pop ? backOut(prog(tau, g.appear[n.name], 0.35)) : 1;
        const { f, col } = flashLevel(n.name, L, S, F, w2, w3);
        const ec = col !== INK ? mix(INK, col, f) : INK;
        const fc = col !== INK ? mix(WHITE, col, 0.18 * f) : WHITE;
        const size = n.size * s * (1 + 0.14 * f);
        if (size <= 0.5) continue;
        rbox(ctx, n.x, n.y, size, size, 6 * s * L.U, fc, ec, 3.2 * L.U);
        if (n.kind === 'equal') {
            text(ctx, '=', [n.x, n.y + 1 * L.U], { size: 24 * s * L.U, color: ec, alpha: 1, font: F.font, weight: '700' });
        }
    }
}

function drawTerminals(ctx: Ctx, L: Layout, S: Scheds, F: Frame, w2: number, w3: number) {
    const t12 = (F.p - 1) * SEG12.dur, t23 = (F.p - 2) * SEG23.dur;
    const l3 = loop(S.ai.track, F.idle3).lt;
    for (let t = 1; t <= T; t++) {
        const name = `Y${t}`, n = L.nodes[name];
        let data = 0, goal = 0;
        const o = SEG12.obs.find(o => o.node === name);
        if (o) data = F.p >= 2 ? 1 : F.p <= 1 ? 0 : backOut(prog(t12, o.t0 + SEG12.obsDur, 0.35));
        const gl = SEG23.goals.find(g => g.node === name);
        if (gl) goal = F.p >= 3 ? 1 : F.p <= 2 ? 0 : backOut(prog(t23, gl.t, 0.35));
        if (name === 'Y3' && w3 > 0) {
            const back = 1 - ease(prog(l3, S.ai.reset, 0.5));
            goal *= 1 - w3 * ease(prog(l3, S.ai.obsArrive, 0.25)) * back;
            data = w3 * backOut(prog(l3, S.ai.obsArrive, 0.35)) * back;
        }
        const { f } = flashLevel(name, L, S, F, w2, w3);
        if (goal > 0.01) {
            const sz = 46 * L.U * goal * (1 + 0.14 * f);
            rbox(ctx, n.x, n.y, sz, sz, 7 * goal * L.U, GOAL, mix(GOAL, '#101073', 0.25), 2.2 * L.U);
            ctx.strokeStyle = WHITE;
            ctx.lineWidth = 3 * L.U;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 11.5 * goal * L.U, 0, Math.PI * 2);
            ctx.stroke();
            dot(ctx, [n.x, n.y], 4.2 * goal * L.U, WHITE, 1);
        }
        if (data > 0.01) {
            const sz = 22 * L.U * data * (1 + 0.25 * f);
            rbox(ctx, n.x, n.y, sz, sz, 3 * L.U, INK_TEXT, INK_TEXT, 1);
        }
    }
}

function drawFlights(ctx: Ctx, L: Layout, S: Scheds, F: Frame) {
    for (let i = 0; i < TERMS.length; i++) {
        const fl = termFlight(i, L, S, F);
        if (!fl || fl.outline <= 0) continue;
        rbox(ctx, fl.x, fl.y, fl.w, fl.h, lerp(9, 6, fl.k) * L.U, WHITE, null, 0, Math.max(fl.outline, ease(prog(fl.k, 0.15, 0.55))));
        rbox(ctx, fl.x, fl.y, fl.w, fl.h, lerp(9, 6, fl.k) * L.U, null, INK, lerp(2.0, 3.2, fl.k) * L.U, fl.outline);
    }
}

export function drawScene(ctx: Ctx, L: Layout, S: Scheds, F: Frame) {
    const w2 = idleWeight(F.p, 2), w3 = idleWeight(F.p, 3);
    drawWorld(ctx, L, F);
    drawNow(ctx, L, S, F, w3);
    drawEdges(ctx, L, S, F);
    drawMsgs(ctx, L, S.mp.track, F.idle2, w2);
    drawMsgs(ctx, L, S.ai.track, F.idle3, w3);
    drawIO(ctx, L, S, F, w2, w3);
    drawBeliefs(ctx, L, S, F, w2, w3);
    drawNodes(ctx, L, S, F, w2, w3);
    drawTerminals(ctx, L, S, F, w2, w3);
    drawFlights(ctx, L, S, F);
}
