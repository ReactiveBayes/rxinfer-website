// Timelines of the story. The story position p ∈ [0, 3] is split into three segments
// (model -> graph -> message passing -> active inference) whose state is a pure function of
// the local segment time, so they play equally well forwards and backwards. Steps 2 and 3
// additionally run looping "idle" tracks (message passing, active inference).

import { ease, prog, lerp } from './engine';
import { Layout, TERMS, T, findEdge } from './geometry';
import { INK, VAR_COLORS } from './palette';

export interface Msg { a: string; b: string; t0: number; v: number; color: string; L: number; fade: boolean }
export interface Flash { t: number; color: string; repeat?: boolean }
export interface Upd { t: number; mu: number; sig: number; dur: number; relax?: boolean }
export interface Riser { node: string; t0: number; t1: number; label?: string; repeat?: boolean }
export interface Act { node: string; t0: number; label?: string }
export interface BState { mu: number; sig: number }

export const VAGUE: Record<string, BState> = { th: { mu: 0, sig: 1.5 } };
export const SETTLED: Record<string, BState> = {
    th: { mu: 0.6, sig: 0.45 },
    x1: { mu: 0.1, sig: 0.30 }, x2: { mu: -0.35, sig: 0.32 },
    x3: { mu: -0.05, sig: 0.85 }, x4: { mu: 0.15, sig: 1.10 },
};
for (let t = 1; t <= T; t++) {
    VAGUE[`x${t}`] = { mu: 0, sig: 1.6 };
    VAGUE[`u${t}`] = { mu: 0, sig: 1.3 };
    SETTLED[`u${t}`] = VAGUE[`u${t}`];
}

export class Track {
    msgs: Msg[] = [];
    flashes: Record<string, Flash[]> = {};
    ups: Record<string, Upd[]> = {};
    risers: Riser[] = [];
    actions: Act[] = [];
    cycle = 0;

    constructor(private L: Layout) { }

    flash(node: string, t: number, color: string, repeat = false) {
        (this.flashes[node] ??= []).push({ t, color, repeat });
    }

    // Message chain along consecutive nodes; returns the arrival time per node. Each message is
    // coloured like the variable on its edge.
    send(seq: string[], t0: number, speed = 650, gap = 0.06) {
        const arr: Record<string, number> = {};
        let t = t0;
        for (let i = 0; i + 1 < seq.length; i++) {
            const e = findEdge(this.L, seq[i], seq[i + 1]);
            const color = VAR_COLORS[e.v];
            this.msgs.push({ a: seq[i], b: seq[i + 1], t0: t, v: speed, color, L: e.L, fade: e.dangling });
            t += e.L / speed;
            this.flash(seq[i + 1], t, color);
            arr[seq[i + 1]] = t;
            t += gap;
        }
        return arr;
    }

    update(name: string, t: number, mu: number, sig: number, dur = 0.45, relax = false) {
        (this.ups[name] ??= []).push({ t, mu, sig, dur, relax });
    }

    observe(node: string, t0: number, dur = 0.6, label?: string, repeat = false) {
        this.risers.push({ node, t0, t1: t0 + dur, label, repeat });
        this.flash(node, t0 + dur, INK, repeat);
        return t0 + dur;
    }

    lastUpdate() {
        let m = 0;
        for (const us of Object.values(this.ups)) for (const u of us) m = Math.max(m, u.t + u.dur);
        return m;
    }

    sort() {
        for (const us of Object.values(this.ups)) us.sort((a, b) => a.t - b.t);
    }
}

// ------------------------------------------------------------------ graph construction
export interface GraphSched {
    appear: Record<string, number>;
    edges: { fromA: boolean; g0: number; g1: number }[];   // aligned with layout.edges
    flights: { f0: number; f1: number }[];                   // aligned with TERMS
    dur: number;
}

function finish(L: Layout, appear: Record<string, number>, flights: GraphSched['flights']): GraphSched {
    for (let t = 1; t <= T; t++) appear[`Y${t}`] = appear[`G${t}`];
    appear.Xend = appear[`E${T}`];
    appear.Thend = appear[`T${T}`];
    const edges = L.edges.map(e => {
        const ta = appear[e.a], tb = appear[e.b];
        const g0 = Math.max(ta, tb) + 0.03;
        return { fromA: ta <= tb, g0, g1: g0 + e.L / 1500 + 0.12 };
    });
    const dur = Math.max(...edges.map(e => e.g1)) + 0.4;
    return { appear, edges, flights, dur };
}

// Segment 0 -> 1: equation terms fly into their factor nodes, the rest of the graph grows.
export function modelToGraph(L: Layout): GraphSched {
    const appear: Record<string, number> = {};
    const flights = TERMS.map((term, i) => {
        const f0 = 0.35 + 0.075 * i;
        appear[term.node] = f0 + 0.9;
        return { f0, f1: f0 + 0.9 };
    });
    for (let t = 1; t <= T; t++) {
        appear[`T${t}`] = appear[`F${t}`] + 0.08;
        appear[`E${t}`] = appear[`F${t}`] + 0.16;
    }
    return finish(L, appear, flights);
}

// First page load: the graph builds itself along the time axis.
export function introBuild(L: Layout): GraphSched {
    const appear: Record<string, number> = {};
    const s = (n: { x: number; y: number }) => (L.mobile ? n.y : n.x);
    const lo = s(L.nodes.Pth), hi = s(L.nodes[`E${T}`]);
    for (const n of Object.values(L.nodes)) {
        appear[n.name] = 0.1 + 1.0 * (s(n) - lo) / (hi - lo) + (n.kind === 'equal' ? 0.06 : 0);
    }
    return finish(L, appear, []);
}

// ------------------------------------------------------------------ segment timings
export const SEG12 = { dur: 1.5, obs: [{ node: 'Y1', t0: 0.35 }, { node: 'Y2', t0: 0.6 }], obsDur: 0.6 };
export const SEG23 = { dur: 1.3, goals: [{ node: 'Y3', t: 0.55 }, { node: 'Y4', t: 0.7 }] };

// ------------------------------------------------------------------ idle 2: message passing
export function messagePassing(L: Layout) {
    const tr = new Track(L);
    const at = (x: number) => 0.7 + x - 1.0;     // original script time (relative to T_C)

    // fresh data on every repetition after the first one
    tr.observe('Y1', 0.0, 0.5, undefined, true);
    tr.observe('Y2', 0.15, 0.5, undefined, true);

    tr.send(['Pth', 'T1', 'F1'], at(1.0));
    tr.send(['Px0', 'F1'], at(1.0));
    tr.send(['U1', 'F1'], at(1.05));
    tr.send(['U2', 'F2'], at(1.1));
    tr.send(['Y1', 'G1', 'E1'], at(1.0));
    tr.send(['Y2', 'G2', 'E2'], at(1.3));
    const fw = tr.send(['F1', 'E1', 'F2', 'E2', 'F3', 'E3', 'F4', 'E4', 'Xend'], at(1.6), 600);
    tr.update('x1', fw.E1, 0.35, 0.70);
    tr.update('x2', fw.E2, -0.45, 0.60);
    tr.update('x3', fw.E3, -0.1, 1.15);
    tr.update('x4', fw.E4, 0.2, 1.45);

    const bw = tr.send(['E2', 'F2', 'E1', 'F1', 'Px0'], at(4.0), 600);
    tr.update('x1', bw.E1, 0.1, 0.50);
    const lt = tr.send(['F2', 'T2', 'T1'], bw.F2 + 0.05, 600);
    tr.send(['F1', 'T1'], bw.F1 + 0.05, 600);
    tr.update('th', lt.T1, 0.5, 0.80);

    // second sweep: faster, everything sharpens
    const t2 = at(6.2);
    tr.send(['T1', 'T2', 'T3', 'T4', 'Thend'], t2, 1100, 0.03);
    tr.send(['T3', 'F3'], t2 + 0.45, 1100);
    tr.send(['T4', 'F4'], t2 + 0.80, 1100);
    tr.send(['Y1', 'G1', 'E1'], t2, 1100);
    tr.send(['Y2', 'G2', 'E2'], t2 + 0.1, 1100);
    const fw2 = tr.send(['F1', 'E1', 'F2', 'E2', 'F3', 'E3', 'F4', 'E4', 'Xend'], t2 + 0.3, 1100, 0.03);
    tr.update('x1', fw2.E1, 0.15, 0.36);
    tr.update('x2', fw2.E2, -0.35, 0.32);
    tr.update('x3', fw2.E3, -0.05, 0.85);
    tr.update('x4', fw2.E4, 0.15, 1.10);
    const bw2 = tr.send(['E2', 'F2', 'E1', 'F1'], t2 + 1.7, 1100, 0.03);
    tr.send(['F2', 'T2', 'T1'], bw2.F2 + 0.03, 1100);
    const lt2 = tr.send(['F1', 'T1'], bw2.F1 + 0.03, 1100);
    tr.update('x1', bw2.E1, 0.1, 0.30);
    tr.update('th', lt2.T1, 0.6, 0.45);

    // let the result sink in, then forget everything and start over with new data
    const settle = tr.lastUpdate() + 0.2;
    const relax = settle + 1.8;
    for (const name of ['th', 'x1', 'x2', 'x3', 'x4']) {
        tr.update(name, relax, VAGUE[name].mu, VAGUE[name].sig, 0.9, true);
    }
    tr.cycle = relax + 1.3;
    tr.sort();
    return { track: tr, settle };
}

// ------------------------------------------------------------------ idle 3: active inference
export function activeInference(L: Layout) {
    const tr = new Track(L);
    const at = (x: number) => x - 0.7;            // original script time (relative to T_D)

    const p4 = tr.send(['Y4', 'G4', 'E4', 'F4', 'U4'], at(1.2), 620);
    const p3 = tr.send(['Y3', 'G3', 'E3', 'F3', 'U3'], at(1.4), 620);
    const p43 = tr.send(['F4', 'E3'], p4.F4 + 0.05, 620);
    tr.update('x4', p4.E4, 0.8, 0.95);
    tr.update('x3', p3.E3, 0.45, 0.80);
    tr.update('x3', p43.E3, 0.6, 0.70);
    const uAppear = { u3: p3.U3 - 0.1, u4: p4.U4 - 0.1 };
    tr.update('u3', p3.U3, 0.9, 0.45);
    tr.update('u4', p4.U4, -0.6, 0.65);

    const act1 = p3.U3 + 0.7;
    tr.actions.push({ node: 'U3', t0: act1, label: 'action' });
    const obs1 = act1 + 0.9;
    const obsArrive = tr.observe('Y3', obs1, 0.65, 'observation');
    const nowMove = obsArrive + 0.35;               // "now" slides over [nowMove, nowMove + 0.8]

    const t3 = obs1 + 1.9;
    const o3 = tr.send(['Y3', 'G3', 'E3'], t3, 700);
    tr.update('x3', o3.E3, 0.75, 0.38);
    const f3 = tr.send(['F3', 'E3', 'F4', 'E4', 'Xend'], t3 + 0.2, 700);
    tr.update('x4', f3.E4, 0.85, 0.70);
    const p4b = tr.send(['Y4', 'G4', 'E4', 'F4', 'U4'], f3.E4 + 0.1, 700);
    tr.update('x4', p4b.E4, 1.0, 0.50);
    tr.update('u4', p4b.U4, -0.4, 0.38);
    const act2 = p4b.U4 + 0.6;
    tr.actions.push({ node: 'U4', t0: act2 });

    // rewind the world and plan again
    const reset = act2 + 2.4;
    for (const name of ['x3', 'x4', 'u3', 'u4']) {
        tr.update(name, reset, SETTLED[name].mu, SETTLED[name].sig, 0.8, true);
    }
    tr.cycle = reset + 1.4;
    tr.sort();
    return { track: tr, uAppear, obsArrive, nowMove, reset, settle: act2 + 1.6 };
}

export type MP = ReturnType<typeof messagePassing>;
export type AI = ReturnType<typeof activeInference>;

// ------------------------------------------------------------------ evaluation helpers
export function beliefAt(ups: Upd[] | undefined, init: BState, t: number, salt: number, cycle: number): BState {
    let { mu, sig } = init;
    if (!ups) return { mu, sig };
    for (const u of ups) {
        if (t < u.t) break;
        const k = ease(prog(t, u.t, u.dur));
        // every repetition sees slightly different data, so the posterior moves a bit
        const target = u.relax || cycle === 0 ? u.mu : u.mu + 0.22 * Math.sin(cycle * 2.3 + salt * 1.7);
        mu = lerp(mu, target, k);
        sig = lerp(sig, u.sig, k);
    }
    return { mu, sig };
}

export function nowPosition(L: Layout, ai: AI, t: number): number {
    const fwd = ease(prog(t, ai.nowMove, 0.8));
    const back = ease(prog(t, ai.reset, 1.0));
    return lerp(L.nowS[0], L.nowS[1], fwd * (1 - back));
}
