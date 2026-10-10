// Hit-testing for the explanation cards: what part of the graph is under the pointer.

import * as G from './geometry';
import type { Layout } from './geometry';

export type HitKind = 'prior' | 'transition' | 'likelihood' | 'control' | 'equality' | 'edge' | 'belief' | 'data' | 'goal';

export interface Hit {
    kind: HitKind;
    id: string;          // node name, or variable key for edges and beliefs
    v?: string;          // variable key (edges, beliefs)
    term?: number;       // index into TERMS for factor nodes
    x: number;           // anchor in scene coordinates
    y: number;
}

const termIndex = (node: string) => G.TERMS.findIndex(term => term.node === node);

const FACTOR_KIND: Record<string, HitKind> = { P: 'prior', F: 'transition', G: 'likelihood', U: 'control' };

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

// What is under the point (vx, vy), given the story position p. Only parts that are visible
// at p can be hit.
export function hitTest(L: Layout, p: number, vx: number, vy: number): Hit | null {
    if (p < 0.99) return null;
    const pad = 8 * L.U;

    for (const [i, name] of G.OBS_NODES.entries()) {
        const t = i + 1, n = L.nodes[name];
        const isGoal = t >= 3 && p > 2.6, isData = t <= 2 && p > 1.7;
        if ((isGoal || isData) && Math.abs(vx - n.x) < 30 * L.U && Math.abs(vy - n.y) < 30 * L.U) {
            return { kind: isGoal ? 'goal' : 'data', id: n.name, x: n.x, y: n.y - 26 * L.U };
        }
    }
    for (const n of Object.values(L.nodes)) {
        if (n.kind !== 'factor' && n.kind !== 'equal') continue;
        const r = n.size / 2 + pad;
        if (Math.abs(vx - n.x) > r || Math.abs(vy - n.y) > r) continue;
        if (n.kind === 'equal') return { kind: 'equality', id: n.name, x: n.x, y: n.y - n.size / 2 };
        return { kind: FACTOR_KIND[n.name[0]], id: n.name, term: termIndex(n.name), x: n.x, y: n.y - n.size / 2 };
    }
    // control beliefs are only drawn during active inference, and only for the future steps
    const beliefs = Object.keys(L.anchors).filter(v => v[0] !== 'u' || (p > 2.9 && (v === 'u3' || v === 'u4')));
    for (const v of beliefs) {
        const an = L.anchors[v];
        const rx = vx - an.x, ry = vy - an.y;
        const along = rx * an.along[0] + ry * an.along[1];
        const up = rx * an.up[0] + ry * an.up[1];
        if (Math.abs(along) < an.hw * L.U * 0.8 && up > 4 * L.U && up < 80 * L.U) {
            const [x, y] = [an.x + an.up[0] * 40 * L.U, an.y + an.up[1] * 40 * L.U];
            return { kind: 'belief', id: v, v, x, y: L.mobile ? y - 20 : y - 30 * L.U };
        }
    }
    for (const e of L.edges) {
        const a = L.nodes[e.a], b = L.nodes[e.b];
        if (segDist(vx, vy, a.x, a.y, b.x, b.y) < 10 * L.U) {
            const bx = e.dangling ? a.x + (b.x - a.x) * 0.3 : b.x, by = e.dangling ? a.y + (b.y - a.y) * 0.3 : b.y;
            if (e.dangling && segDist(vx, vy, a.x, a.y, bx, by) > 10 * L.U) continue;
            return { kind: 'edge', id: `${e.a}-${e.b}`, v: e.v, x: vx, y: vy - 8 * L.U };
        }
    }
    return null;
}
