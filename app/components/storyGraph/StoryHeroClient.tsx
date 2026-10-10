'use client'

import 'katex/dist/katex.min.css';
import { Fragment, PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsVisible } from '../../hooks/useIsVisible';
import { buildLayout, TERMS } from './geometry';
import { SEG12, SEG23, activeInference, introBuild, messagePassing, modelToGraph } from './choreography';
import { Frame, Rect, Scheds, drawScene, edgeLabelAlpha, equationAlpha, idleWeight, termFlight } from './draw';
import { lerp } from './engine';
import StepBar, { STEPS } from './StepBar';

interface Props {
    terms: string[];
    lhs: string;
    times: string;
    posterior: string;
    labels: Record<string, string>;
}

const DEFAULT_STEP = 2;

function segDurations(S: Scheds) {
    return [S.seg01.dur, SEG12.dur, SEG23.dur];
}

// Nominal time it takes to move the story position from p to q.
function travelTime(S: Scheds, p: number, q: number) {
    const D = segDurations(S);
    const lo = Math.min(p, q), hi = Math.max(p, q);
    let total = 0;
    for (let s = 0; s < 3; s++) total += Math.max(0, Math.min(hi, s + 1) - Math.max(lo, s)) * D[s];
    return total;
}

export default function StoryHeroClient({ terms, lhs, times, posterior, labels }: Props) {
    const [target, setTarget] = useState(DEFAULT_STEP);
    const [mobile, setMobile] = useState(false);
    const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);

    const L = useMemo(() => buildLayout(mobile), [mobile]);
    const S = useMemo<Scheds>(() => ({
        seg01: modelToGraph(L), intro: introBuild(L), mp: messagePassing(L), ai: activeInference(L),
    }), [L]);
    const labelEdges = useMemo(() => L.labels.map(lb =>
        L.edges.findIndex(e => (e.a === lb.edge[0] && e.b === lb.edge[1]) || (e.a === lb.edge[1] && e.b === lb.edge[0]))), [L]);

    const sceneRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const eqRef = useRef<HTMLDivElement>(null);
    const termRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const labelRefs = useRef<Record<string, HTMLSpanElement | null>>({});
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const underlineRef = useRef<HTMLSpanElement>(null);
    const { isVisible, targetRef } = useIsVisible({ rootMargin: '100px' });

    // Mutable animation state; the render loop never goes through React.
    const st = useRef({
        p: 1, target: DEFAULT_STEP, speed: 1, introT: 0, idle2: 0, idle3: 0, last: 0, time: 0,
        hoverNode: null as string | null, hoverShown: null as string | null, hoverK: 0,
        k: 1, dpr: 1, homes: null as Rect[] | null, font: 'Lato, Arial, sans-serif', reduced: false,
        L, S, labelEdges,
    });
    useEffect(() => {
        Object.assign(st.current, { L, S, labelEdges, homes: null });
    }, [L, S, labelEdges]);

    const goTo = useCallback((i: number) => {
        const s = st.current;
        s.introT = Math.max(s.introT, s.S.intro.dur);
        const nominal = travelTime(s.S, s.p, i);
        const steps = Math.abs(i - s.p);
        let speed = i < s.p ? 1.5 : 1;
        // jumps over several steps replay the story in fast-forward / rewind
        if (steps > 1.01) speed = Math.max(speed, nominal / (0.9 + 0.45 * steps));
        if (s.reduced) speed = Math.max(nominal / 0.4, 1);
        s.speed = speed;
        s.target = i;
        setTarget(i);
    }, []);

    // --------------------------------------------------------------- layout & measuring
    const measure = useCallback(() => {
        const s = st.current, scene = sceneRef.current, canvas = canvasRef.current;
        if (!scene || !canvas) return;
        const w = scene.clientWidth, h = scene.clientHeight;
        s.dpr = Math.min(window.devicePixelRatio || 1, 2);
        s.k = w / s.L.view.w;
        canvas.width = Math.round(w * s.dpr);
        canvas.height = Math.round(h * s.dpr);
        scene.style.setProperty('--k', String(s.k));
        scene.style.setProperty('--u', String(s.L.U));
        // offsetLeft/Top ignore transforms, so this gives the resting place of every term
        s.homes = termRefs.current.map(el => el ? {
            cx: (el.offsetLeft + el.offsetWidth / 2) / s.k + s.L.view.x0,
            cy: (el.offsetTop + el.offsetHeight / 2) / s.k + s.L.view.y0,
            w: el.offsetWidth / s.k,
            h: el.offsetHeight / s.k,
        } : { cx: 0, cy: 0, w: 0, h: 0 });
    }, []);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const onChange = () => setMobile(!mq.matches);
        onChange();
        mq.addEventListener('change', onChange);
        const s = st.current;
        s.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (s.reduced) { s.introT = 1e9; s.p = DEFAULT_STEP; }
        const lato = getComputedStyle(document.body).getPropertyValue('--font-lato').trim();
        if (lato) s.font = `${lato}, Arial, sans-serif`;
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        measure();
        const ro = new ResizeObserver(() => measure());
        ro.observe(scene);
        document.fonts?.ready.then(() => measure());
        return () => ro.disconnect();
    }, [measure, L]);

    // --------------------------------------------------------------- render loop
    const render = useCallback(() => {
        const s = st.current, canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const { L, S } = s;
        const F: Frame = {
            p: s.p, introT: s.introT, idle2: s.idle2, idle3: s.idle3, time: s.time, font: s.font,
            dpr: s.dpr, hover: s.hoverShown ? { name: s.hoverShown, k: s.hoverK } : null, homes: s.homes,
        };
        const sc = s.dpr * s.k;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(sc, 0, 0, sc, -sc * L.view.x0, -sc * L.view.y0);
        drawScene(ctx, L, S, F);

        // equation overlay
        const eq = eqRef.current;
        if (eq) {
            const visible = s.p < 1;
            eq.style.visibility = visible ? 'visible' : 'hidden';
            eq.style.pointerEvents = s.p < 0.3 ? 'auto' : 'none';
            if (visible) {
                const a = String(equationAlpha(S, F));
                eq.querySelectorAll<HTMLElement>('.sg-fade').forEach(el => { el.style.opacity = a; });
                termRefs.current.forEach((el, i) => {
                    if (!el) return;
                    const fl = termFlight(i, L, S, F);
                    if (!fl) {
                        const flown = s.homes && s.p * S.seg01.dur >= S.seg01.flights[i].f1;
                        el.style.opacity = flown ? '0' : '1';
                        el.style.transform = '';
                        return;
                    }
                    const home = s.homes![i];
                    el.style.opacity = String(fl.textAlpha);
                    el.style.transform = `translate(${(fl.x - home.cx) * s.k}px, ${(fl.y - home.cy) * s.k}px) scale(${fl.scale})`;
                });
            }
        }

        // edge labels
        L.labels.forEach((lb, i) => {
            const el = labelRefs.current[lb.key];
            if (!el) return;
            const tx = lb.align === 'left' ? '0' : lb.align === 'right' ? '-100%' : '-50%';
            el.style.transform = `translate(${(lb.x - L.view.x0) * s.k}px, ${(lb.y - L.view.y0) * s.k}px) translate(${tx}, -50%)`;
            el.style.opacity = String(edgeLabelAlpha(S, F, s.labelEdges[i]));
        });

        // underline follows the story position continuously
        const ul = underlineRef.current, tabs = tabRefs.current;
        if (ul && tabs.every(Boolean)) {
            const i0 = Math.min(3, Math.floor(s.p)), i1 = Math.min(3, i0 + 1), f = s.p - i0;
            const a = tabs[i0]!, b = tabs[i1]!;
            ul.style.transform = `translateX(${lerp(a.offsetLeft, b.offsetLeft, f) + 8}px)`;
            ul.style.width = `${lerp(a.offsetWidth, b.offsetWidth, f) - 16}px`;
        }
    }, []);

    const running = useRef({ raf: 0, active: false });
    const tick = useCallback((now: number) => {
        const s = st.current, r = running.current;
        r.raf = 0;
        if (!r.active) return;
        const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 0;
        s.last = now;
        if (s.introT < s.S.intro.dur) {
            s.introT += dt;
        } else if (s.p !== s.target) {
            const dir = Math.sign(s.target - s.p);
            const seg = Math.max(0, Math.min(2, dir > 0 ? Math.floor(s.p) : Math.ceil(s.p) - 1));
            s.p += dir * dt * s.speed / segDurations(s.S)[seg];
            if ((dir > 0 && s.p >= s.target) || (dir < 0 && s.p <= s.target)) s.p = s.target;
        }
        // idle loops restart every time their step is entered from far away
        const w2 = idleWeight(s.p, 2), w3 = idleWeight(s.p, 3);
        s.idle2 = s.reduced ? s.S.mp.settle : w2 > 0 ? s.idle2 + dt : 0;
        s.idle3 = s.reduced ? s.S.ai.settle : w3 > 0 ? s.idle3 + dt : 0;
        if (!s.reduced) s.time += dt;
        // hovered factor nodes grow and cast a soft shadow, like on the old landing graph
        if (s.hoverNode && s.hoverNode !== s.hoverShown) {
            if (s.hoverK <= 0.05) s.hoverShown = s.hoverNode;
            s.hoverK = Math.max(0, s.hoverK - dt / 0.2);
        } else {
            s.hoverK = Math.min(1, Math.max(0, s.hoverK + (s.hoverNode ? 1 : -1) * dt / 0.2));
        }
        render();
        r.raf = requestAnimationFrame(tick);
    }, [render]);

    useEffect(() => {
        const r = running.current;
        const update = () => {
            const active = isVisible && !document.hidden;
            if (active === r.active) return;
            r.active = active;
            st.current.last = 0;
            if (active && !r.raf) r.raf = requestAnimationFrame(tick);
        };
        update();
        document.addEventListener('visibilitychange', update);
        return () => {
            document.removeEventListener('visibilitychange', update);
            r.active = false;
            if (r.raf) cancelAnimationFrame(r.raf);
            r.raf = 0;
        };
    }, [isVisible, tick]);

    // --------------------------------------------------------------- interaction
    const swipe = useRef<{ x: number; y: number } | null>(null);

    const onPointerMove = (e: PointerEvent) => {
        const s = st.current, scene = sceneRef.current;
        if (!scene || e.pointerType !== 'mouse') return;
        let found: { i: number; x: number; y: number } | null = null;
        if (s.p > 0.99) {
            const rect = scene.getBoundingClientRect();
            const vx = (e.clientX - rect.left) / s.k + L.view.x0;
            const vy = (e.clientY - rect.top) / s.k + L.view.y0;
            for (let i = 0; i < TERMS.length; i++) {
                const n = L.nodes[TERMS[i].node];
                if (Math.abs(vx - n.x) < n.size * 0.7 && Math.abs(vy - n.y) < n.size * 0.7) {
                    found = { i, x: (n.x - L.view.x0) * s.k, y: (n.y - n.size / 2 - L.view.y0) * s.k };
                }
            }
        }
        s.hoverNode = found ? TERMS[found.i].node : null;
        setHover(h => (h?.i === found?.i ? h : found));
    };

    const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
        const s0 = swipe.current;
        swipe.current = null;
        if (!s0) return;
        const dx = e.clientX - s0.x, dy = e.clientY - s0.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) {
            goTo(Math.max(0, Math.min(3, st.current.target + (dx < 0 ? 1 : -1))));
        }
    };

    return (
        <section ref={el => { targetRef.current = el; }} className="mx-auto w-full max-w-7xl px-1 md:px-6">
            <StepBar target={target} onSelect={goTo} tabRefs={tabRefs} underlineRef={underlineRef} />
            <div
                id="story-scene"
                ref={sceneRef}
                role="img"
                aria-label={`Animation: ${STEPS[target].title}. ${STEPS[target].caption}`}
                className="relative mt-2 aspect-[940/1650] w-full touch-pan-y select-none md:aspect-[1920/950]"
                onPointerMove={onPointerMove}
                onPointerLeave={() => { st.current.hoverNode = null; setHover(null); }}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={() => { swipe.current = null; }}
            >
                <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

                <div ref={eqRef} aria-hidden
                    className="invisible absolute inset-0 flex flex-col items-center justify-center gap-[1em] px-3 text-[#163a4a]"
                    style={{ fontSize: 'calc(var(--k, 0.6) * 40px * var(--u, 1))' }}>
                    <div className="sg-fade" dangerouslySetInnerHTML={{ __html: lhs }} />
                    <div className="flex max-w-[95%] flex-wrap items-center justify-center gap-x-[0.8em] gap-y-[0.6em]">
                        {terms.map((html, i) => (
                            <Fragment key={i}>
                                {(i === 2 || i === 8) && <>
                                    <span className="hidden h-0 basis-full md:block" />
                                    <span className="sg-fade hidden md:inline" dangerouslySetInnerHTML={{ __html: times }} />
                                </>}
                                <span
                                    ref={el => { termRefs.current[i] = el; }}
                                    className="inline-block whitespace-nowrap rounded-md transition-colors duration-200 will-change-transform hover:text-[#0aa8a7]"
                                    dangerouslySetInnerHTML={{ __html: html }}
                                />
                            </Fragment>
                        ))}
                    </div>
                    <div className="sg-fade mt-[0.3em] whitespace-nowrap text-[0.7em] text-[#6b7b8c] md:text-[0.85em]" dangerouslySetInnerHTML={{ __html: posterior }} />
                </div>

                <div aria-hidden className="pointer-events-none absolute inset-0 text-[#6b7b8c]"
                    style={{ fontSize: 'calc(var(--k, 0.6) * 27px * var(--u, 1))' }}>
                    {L.labels.map(lb => (
                        <span key={lb.key} ref={el => { labelRefs.current[lb.key] = el; }}
                            className="absolute left-0 top-0 whitespace-nowrap opacity-0"
                            dangerouslySetInnerHTML={{ __html: labels[lb.key] }} />
                    ))}
                </div>

                {hover && (
                    <div aria-hidden
                        className="sg-fade-in pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-[#0aa8a7]/30 bg-white/95 px-3 py-1.5 text-[#163a4a] shadow-lg"
                        style={{ left: hover.x, top: hover.y - 8 }}
                        dangerouslySetInnerHTML={{ __html: terms[hover.i] }} />
                )}
            </div>
        </section>
    );
}
