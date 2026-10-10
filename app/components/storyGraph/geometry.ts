// Geometry of the factor graph. The graph is defined along two axes: "story" (time flows
// along it) and "depth" (parameters -> states -> controls/observations -> world). On wide
// screens story is horizontal; on phones the graph is transposed so time flows downwards.

export type Kind = 'factor' | 'equal' | 'terminal' | 'end';

export interface GNode { name: string; x: number; y: number; kind: Kind; size: number; glyph?: string }
export interface GEdge { a: string; b: string; v: string; L: number; dangling: boolean }
export interface GLabel { key: string; edge: [string, string]; x: number; y: number; align: 'left' | 'center' | 'right' }
// A belief density sits on an edge: centred at (x, y), spread along `along`, bulging towards `up`.
export interface Anchor { x: number; y: number; hw: number; along: [number, number]; up: [number, number] }

export interface Layout {
    mobile: boolean;
    U: number;                                   // size multiplier for strokes, nodes, fonts
    view: { x0: number; y0: number; w: number; h: number };
    XF: number[];                                // story position of the transition factors
    XE: number[];                                // story position of the equality nodes on x_t
    sMax: number;
    dTh: number; dX: number; dGU: number; dY: number; dWorld: number; dMax: number;
    region: [number, number];                    // depth range of the "future" region
    nowS: [number, number];                      // story position of "now" before / after acting
    nodes: Record<string, GNode>;
    edges: GEdge[];
    labels: GLabel[];
    anchors: Record<string, Anchor>;
    map: (s: number, d: number) => [number, number];
}

export const T = 4;

// Factor terms of the generative model, in the order they appear in the equation.
export const TERMS: { node: string; tex: string }[] = [
    { node: 'Pth', tex: 'p(\\theta)' },
    { node: 'Px0', tex: 'p(x_0)' },
];
for (let t = 1; t <= T; t++) {
    TERMS.push(
        { node: `F${t}`, tex: `p(x_${t}\\,|\\,x_${t - 1},\\, u_${t},\\, \\theta)` },
        { node: `G${t}`, tex: `p(y_${t}\\,|\\,x_${t})` },
        { node: `U${t}`, tex: `p(u_${t})` },
    );
}

export const LABEL_TEX: Record<string, string> = { th: '\\theta', x0: 'x_0' };
for (let t = 1; t <= T; t++) {
    LABEL_TEX[`x${t}`] = `x_${t}`;
    LABEL_TEX[`u${t}`] = `u_${t}`;
    LABEL_TEX[`y${t}`] = `y_${t}`;
}

const DESKTOP = {
    XF0: 330, DX: 400, DE: 190, XP: 150, XEND: 1880, sMax: 1920,
    dTh: 235, dX: 580, dGU: 770, dY: 905, dWorld: 1000, dMax: 1080,
    region: [175, 940] as [number, number],
    U: 1,
};

const MOBILE = {
    XF0: 300, DX: 330, DE: 160, XP: 130, XEND: 1640, sMax: 1700,
    dTh: 200, dX: 480, dGU: 650, dY: 770, dWorld: 850, dMax: 940,
    region: [90, 830] as [number, number],
    U: 1.2,
};

export function buildLayout(mobile: boolean): Layout {
    const C = mobile ? MOBILE : DESKTOP;
    const map = mobile
        ? (s: number, d: number): [number, number] => [d, s]
        : (s: number, d: number): [number, number] => [s, d];
    const XF = [0], XE = [0];
    for (let t = 1; t <= T; t++) {
        XF.push(C.XF0 + C.DX * (t - 1));
        XE.push(XF[t] + C.DE);
    }

    const nodes: Record<string, GNode> = {};
    const add = (name: string, s: number, d: number, kind: Kind, size = 60, glyph?: string) => {
        const [x, y] = map(s, d);
        nodes[name] = { name, x, y, kind, size: size * C.U, glyph };
    };
    const N = '\u{1D4A9}';    // script N, a Gaussian factor
    add('Pth', C.XP, C.dTh, 'factor', 60, N);
    add('Px0', C.XP, C.dX, 'factor', 60, N);
    for (let t = 1; t <= T; t++) {
        add(`T${t}`, XF[t], C.dTh, 'equal', 30);
        add(`F${t}`, XF[t], C.dX, 'factor', 60, 'f');
        add(`U${t}`, XF[t], C.dGU, 'factor', 60, N);
        add(`E${t}`, XE[t], C.dX, 'equal', 30);
        add(`G${t}`, XE[t], C.dGU, 'factor', 60, N);
        add(`Y${t}`, XE[t], C.dY, 'terminal', 46);
    }
    add('Xend', C.XEND, C.dX, 'end', 0);
    add('Thend', C.XEND, C.dTh, 'end', 0);

    const edges: GEdge[] = [];
    const edge = (a: string, b: string, v: string, dangling = false) => {
        const L = Math.hypot(nodes[b].x - nodes[a].x, nodes[b].y - nodes[a].y);
        edges.push({ a, b, v, L, dangling });
    };
    edge('Pth', 'T1', 'th');
    edge('Px0', 'F1', 'x0');
    for (let t = 1; t <= T; t++) {
        edge(`T${t}`, `F${t}`, 'th');
        edge(`U${t}`, `F${t}`, `u${t}`);
        edge(`F${t}`, `E${t}`, `x${t}`);
        edge(`E${t}`, `G${t}`, `x${t}`);
        edge(`G${t}`, `Y${t}`, `y${t}`);
        if (t < T) {
            edge(`E${t}`, `F${t + 1}`, `x${t}`);
            edge(`T${t}`, `T${t + 1}`, 'th');
        }
    }
    edge(`E${T}`, 'Xend', `x${T}`, true);
    edge(`T${T}`, 'Thend', 'th', true);

    // Edge labels, positioned in screen coordinates for each orientation.
    const labels: GLabel[] = [];
    const label = (key: string, edge: [string, string], x: number, y: number, align: GLabel['align']) =>
        labels.push({ key, edge, x, y, align });
    if (!mobile) {
        label('th', ['Pth', 'T1'], 240, C.dTh - 30, 'center');
        label('x0', ['Px0', 'F1'], 240, C.dX + 38, 'center');
        for (let t = 1; t <= T; t++) {
            label(`u${t}`, [`U${t}`, `F${t}`], XF[t] - 22, C.dX + 105, 'right');
            label(`y${t}`, [`G${t}`, `Y${t}`], XE[t] + 22, C.dGU + 72, 'left');
            label(`x${t}`, t < T ? [`E${t}`, `F${t + 1}`] : [`E${t}`, 'Xend'], XE[t] + 62, C.dX + 38, 'center');
        }
    } else {
        const mid = (C.XP + XF[1]) / 2;
        label('th', ['Pth', 'T1'], C.dTh - 26, mid, 'right');
        label('x0', ['Px0', 'F1'], C.dX + 26, mid, 'left');
        for (let t = 1; t <= T; t++) {
            label(`u${t}`, [`U${t}`, `F${t}`], (C.dX + C.dGU) / 2, XF[t] + 28, 'center');
            label(`y${t}`, [`G${t}`, `Y${t}`], (C.dGU + C.dY) / 2 + 8, XE[t] - 28, 'center');
            label(`x${t}`, t < T ? [`E${t}`, `F${t + 1}`] : [`E${t}`, 'Xend'], C.dX + 26, XE[t] + 70, 'left');
        }
    }

    // Where belief densities are drawn: on the edge of their variable, bulging away from it.
    const anchors: Record<string, Anchor> = {};
    const H: [number, number] = [1, 0], V: [number, number] = [0, 1];
    const at = (s: number, d: number, hw: number, along: 'story' | 'depth', bulge: [number, number]): Anchor => {
        const [x, y] = map(s, d);
        const dir = along === 'story' ? (mobile ? V : H) : (mobile ? H : V);
        return { x, y, hw, along: dir, up: bulge };
    };
    for (let t = 1; t <= T; t++) {
        anchors[`x${t}`] = at(XE[t], C.dX, 66, 'story', mobile ? [-1, 0] : [0, -1]);
        anchors[`u${t}`] = at(XF[t], (C.dX + C.dGU) / 2 + (mobile ? 10 : 0), 46, 'depth', mobile ? [0, -1] : [1, 0]);
    }
    anchors.th = at((XF[1] + XF[2]) / 2, C.dTh, 66, 'story', mobile ? [-1, 0] : [0, -1]);

    const v0 = mobile ? { x0: 0, y0: 50, w: C.dMax, h: C.sMax - 50 } : { x0: 0, y0: 130, w: C.sMax, h: C.dMax - 130 };

    return {
        mobile, U: C.U, view: v0, XF, XE, sMax: C.sMax,
        dTh: C.dTh, dX: C.dX, dGU: C.dGU, dY: C.dY, dWorld: C.dWorld, dMax: C.dMax,
        region: C.region,
        nowS: [(XE[2] + XF[3]) / 2, (XE[3] + XF[4]) / 2],
        nodes, edges, labels, anchors, map,
    };
}

export function findEdge(L: Layout, a: string, b: string) {
    for (const e of L.edges) {
        if ((e.a === a && e.b === b) || (e.a === b && e.b === a)) return e;
    }
    throw new Error(`no edge ${a}-${b}`);
}
