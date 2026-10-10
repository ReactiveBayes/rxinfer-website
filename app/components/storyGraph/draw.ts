// Canvas rendering of one frame of the story. Everything here is a pure function of the
// frame state (story position, idle clocks). The story follows Wouter Kouw's BIASlab animation,
// the visual style follows the original RxInfer landing graph.

import { backOut, clip01, ease, easeOut, lerp, prog } from './engine';
import { Layout, TERMS, T } from './geometry';
import {
    AI, GraphSched, MP, SEG12, SEG23, SETTLED, VAGUE, Track, BState,
    beliefAt, nowPosition,
} from './choreography';
import { VAR_COLORS, DATA, FACTOR_FILL, FAINT, GOAL, INK, MUTED, WHITE, WORLD, mix } from './palette';

export interface Scheds { seg01: GraphSched; intro: GraphSched; mp: MP; ai: AI }

export interface Rect { cx: number; cy: number; w: number; h: number }

export interface Frame {
    p: number;
    introT: number;
    idle2: number;
    idle3: number;
    time: number;                // free-running clock for ambient motion
    font: string;
    dpr: number;
    hover: { name: string; k: number } | null;
    homes: Rect[] | null;        // home boxes of the equation terms, in scene coordinates
}

const EDGE_LW = 2.4;
const MATH_FONT = "'Cambria Math', 'STIX Two Math', 'Latin Modern Math', 'Times New Roman', serif";

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
            line(ctx, p0, at(k), INK, EDGE_LW * L.U, 0.7);
            return;
        }
        // solid start, then fading out into the future
        const q = at(Math.min(k, 0.25));
        line(ctx, p0, q, INK, EDGE_LW * L.U, 0.7);
        if (k > 0.25) {
            const end = at(k), full = at(1);
            const grad = ctx.createLinearGradient(q[0], q[1], full[0], full[1]);
            grad.addColorStop(0, 'rgba(10,168,167,0.7)');
            grad.addColorStop(1, 'rgba(10,168,167,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = EDGE_LW * L.U;
            ctx.beginPath();
            ctx.moveTo(q[0], q[1]);
            ctx.lineTo(end[0], end[1]);
            ctx.stroke();
        }
    });
}

function messageDot(ctx: Ctx, p: Pt, r: number, color: string, alpha: number) {
    dot(ctx, p, r * 2.2, color, 0.12 * alpha);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = mix(WHITE, color, 0.15);
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.45;
    ctx.beginPath();
    ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawMsgs(ctx: Ctx, L: Layout, tr: Track, t: number, w: number) {
    if (w <= 0) return;
    const { lt } = loop(tr, t);
    const TR = 110;
    for (const m of tr.msgs) {
        const d = (lt - m.t0) * m.v;
        if (d <= 0 || d - TR >= m.L) continue;
        const head = Math.min(d, m.L), tail = Math.max(0, d - TR);
        if (head - tail < 1) continue;
        const a = L.nodes[m.a], b = L.nodes[m.b];
        const u: Pt = [(b.x - a.x) / m.L, (b.y - a.y) / m.L];
        const fade = m.fade ? (1 - head / m.L) ** 0.8 : 1;
        const hp: Pt = [a.x + u[0] * head, a.y + u[1] * head];
        const tp: Pt = [a.x + u[0] * tail, a.y + u[1] * tail];
        const grad = ctx.createLinearGradient(tp[0], tp[1], hp[0], hp[1]);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, m.color);
        ctx.globalAlpha = 0.6 * fade * w;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.5 * L.U;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tp[0], tp[1]);
        ctx.lineTo(hp[0], hp[1]);
        ctx.stroke();
        ctx.lineCap = 'butt';
        if (d <= m.L) messageDot(ctx, hp, 7 * L.U, m.color, fade * w);
    }
    ctx.globalAlpha = 1;
}

// Little dots drifting along every edge while the factor graph is on display.
function drawAmbient(ctx: Ctx, L: Layout, S: Scheds, F: Frame, w1: number) {
    if (w1 <= 0) return;
    const { g, tau } = graphPhase(S, F);
    L.edges.forEach((e, i) => {
        if (e.dangling || tau < g.edges[i].g1) return;
        const period = 1.6 + 1.8 * ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
        const r = ((F.time + i * 0.37) / period) % 1;
        const a = L.nodes[e.a], b = L.nodes[e.b];
        const p: Pt = [lerp(a.x, b.x, r), lerp(a.y, b.y, r)];
        const k = Math.sin(r * Math.PI);
        messageDot(ctx, p, 5 * L.U * k, VAR_COLORS[e.v], 0.7 * k * w1);
    });
}

function riserDot(ctx: Ctx, L: Layout, s: number, k: number, alpha: number) {
    if (k <= 0 || k >= 1 || alpha <= 0) return;
    const p = L.map(s, lerp(L.dWorld + 50, L.dY + 12, ease(k)));
    dot(ctx, p, 16 * L.U, DATA, 0.12 * alpha);
    dot(ctx, p, 8 * L.U, DATA, alpha);
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
            if (d < L.dWorld + 60 - y0) messageDot(ctx, L.map(s, y0 + d), 7 * L.U, GOAL, w3);
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

function drawBelief(ctx: Ctx, L: Layout, F: Frame, name: string, st: BState, a: number, salt: number) {
    if (a <= 0) return;
    const an = L.anchors[name];
    const color = VAR_COLORS[name];
    // gentle breathing, like the shapes on the old landing graph
    const sig = st.sig * (1 + 0.06 * Math.sin(F.time * 1.3 + salt * 1.9));
    const mu = st.mu + 0.05 * Math.sin(F.time * 0.9 + salt * 2.7);
    const hw = an.hw * L.U;
    const amp = Math.min(80, 44 / sig ** 0.6) * L.U;
    const N = 80;
    const pts: Pt[] = [];
    for (let i = 0; i <= N; i++) {
        const u = -3 + 6 * i / N;
        const h = amp * Math.exp(-0.5 * ((u - mu) / sig) ** 2) * a;
        const s = u * hw / 3;
        pts.push([an.x + an.along[0] * s + an.up[0] * h, an.y + an.along[1] * s + an.up[1] * h]);
    }
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.globalAlpha = 0.4 * a;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 0.65 * a;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6 * L.U;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawBeliefs(ctx: Ctx, L: Layout, S: Scheds, F: Frame, w2: number, w3: number) {
    // every variable carries a (still vague) distribution as soon as the graph is built
    const built = F.p >= 1 ? prog(F.introT, S.intro.dur - 0.5, 0.5) : 1;
    const a = ease(prog(F.p, 0.75, 0.25)) * built;
    const l2 = loop(S.mp.track, F.idle2), l3 = loop(S.ai.track, F.idle3);
    const names = ['th', ...Array.from({ length: T }, (_, i) => `x${i + 1}`)];
    if (a > 0) names.forEach((name, salt) => {
        let st = F.p < 2 ? VAGUE[name] : SETTLED[name];
        if (w2 > 0) st = mixState(st, beliefAt(S.mp.track.ups[name], VAGUE[name], l2.lt, salt, l2.cycle), w2);
        if (w3 > 0) st = mixState(st, beliefAt(S.ai.track.ups[name], SETTLED[name], l3.lt, salt, 0), w3);
        drawBelief(ctx, L, F, name, st, a, salt);
    });
    if (w3 > 0) (['u3', 'u4'] as const).forEach((name, i) => {
        const ua = w3 * ease(prog(l3.lt, S.ai.uAppear[name], 0.4)) * (1 - ease(prog(l3.lt, S.ai.reset, 0.8)));
        drawBelief(ctx, L, F, name, beliefAt(S.ai.track.ups[name], VAGUE[name], l3.lt, 0, 0), ua, 7 + i);
    });
}

function glyph(ctx: Ctx, g: string, x: number, y: number, size: number, color: string, alpha: number) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.font = `${g === 'f' ? 'italic ' : ''}700 ${size}px ${MATH_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(g, x, y + size * 0.04);
    ctx.restore();
}

function drawNodes(ctx: Ctx, L: Layout, S: Scheds, F: Frame, w2: number, w3: number) {
    const { g, tau, pop } = graphPhase(S, F);
    for (const n of Object.values(L.nodes)) {
        if (n.kind !== 'factor' && n.kind !== 'equal') continue;
        if (tau < g.appear[n.name]) continue;
        const s = n.kind === 'equal' || pop ? backOut(prog(tau, g.appear[n.name], 0.35)) : 1;
        const { f, col } = flashLevel(n.name, L, S, F, w2, w3);
        const hk = F.hover?.name === n.name ? F.hover.k : 0;
        const ec = col !== INK ? mix(INK, col, f) : INK;
        const size = n.size * s * (1 + 0.14 * f + 0.1 * hk);
        if (size <= 0.5) continue;
        if (n.kind === 'equal') {
            const fc = col !== INK ? mix(WHITE, col, 0.2 * f) : WHITE;
            rbox(ctx, n.x, n.y, size, size, 4 * s * L.U, fc, ec, 2 * L.U, 0.85 + 0.15 * f);
            text(ctx, '=', [n.x, n.y + 0.5 * L.U], { size: size * 0.62, color: ec, alpha: 0.85 + 0.15 * f, font: F.font, weight: '700' });
            continue;
        }
        const fc = col !== INK ? mix(FACTOR_FILL, col, 0.22 * f) : FACTOR_FILL;
        if (hk > 0) {
            ctx.save();
            ctx.shadowColor = 'rgba(120,130,135,0.45)';
            ctx.shadowBlur = 22 * hk * F.dpr;
            ctx.shadowOffsetX = ctx.shadowOffsetY = 5 * hk * F.dpr;
            rbox(ctx, n.x, n.y, size, size, 3 * L.U, fc, null, 0);
            ctx.restore();
        }
        rbox(ctx, n.x, n.y, size, size, 3 * L.U, fc, ec, EDGE_LW * L.U);
        if (n.glyph) glyph(ctx, n.glyph, n.x, n.y, size / 2.3, ec, 1);
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
            rbox(ctx, n.x, n.y, sz, sz, 3 * L.U, mix(WHITE, GOAL, 0.12), GOAL, 2.2 * L.U);
            ctx.strokeStyle = GOAL;
            ctx.lineWidth = 2.6 * L.U;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 11 * goal * L.U, 0, Math.PI * 2);
            ctx.stroke();
            dot(ctx, [n.x, n.y], 4.2 * goal * L.U, GOAL, 1);
        }
        if (data > 0.01) {
            const sz = 22 * L.U * data * (1 + 0.25 * f);
            rbox(ctx, n.x, n.y, sz, sz, 2 * L.U, DATA, DATA, 1);
        }
    }
}

function drawFlights(ctx: Ctx, L: Layout, S: Scheds, F: Frame) {
    for (let i = 0; i < TERMS.length; i++) {
        const fl = termFlight(i, L, S, F);
        if (!fl || fl.outline <= 0) continue;
        const r = lerp(8, 3, fl.k) * L.U;
        rbox(ctx, fl.x, fl.y, fl.w, fl.h, r, mix(WHITE, FACTOR_FILL, fl.k), null, 0, Math.max(fl.outline, ease(prog(fl.k, 0.15, 0.55))));
        rbox(ctx, fl.x, fl.y, fl.w, fl.h, r, null, INK, lerp(1.6, EDGE_LW, fl.k) * L.U, fl.outline);
        const g = L.nodes[TERMS[i].node].glyph;
        if (g) glyph(ctx, g, fl.x, fl.y, fl.w / 2.3, INK, ease(prog(fl.k, 0.55, 0.45)));
    }
}

export function drawScene(ctx: Ctx, L: Layout, S: Scheds, F: Frame) {
    const w1 = idleWeight(F.p, 1), w2 = idleWeight(F.p, 2), w3 = idleWeight(F.p, 3);
    drawWorld(ctx, L, F);
    drawNow(ctx, L, S, F, w3);
    drawEdges(ctx, L, S, F);
    drawAmbient(ctx, L, S, F, w1);
    drawMsgs(ctx, L, S.mp.track, F.idle2, w2);
    drawMsgs(ctx, L, S.ai.track, F.idle3, w3);
    drawIO(ctx, L, S, F, w2, w3);
    drawBeliefs(ctx, L, S, F, w2, w3);
    drawNodes(ctx, L, S, F, w2, w3);
    drawTerminals(ctx, L, S, F, w2, w3);
    drawFlights(ctx, L, S, F);
}
