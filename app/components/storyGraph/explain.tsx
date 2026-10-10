// Plain-language explanations shown when hovering (or tapping) parts of the graph.

import { ArrowUpRight } from 'lucide-react';
import { Hit } from './hit';
import { GOAL, INK, VAR_COLORS } from './palette';

interface Info { eyebrow: string; title: React.ReactNode; body: string; color: string }

function info(hit: Hit, label: (v: string) => React.ReactNode): Info {
    const v = hit.v ?? '';
    switch (hit.kind) {
        case 'prior': return {
            eyebrow: 'Factor node · prior', color: INK, title: 'What we assume up front',
            body: 'A factor node is one small piece of the model. This one is a prior: it states what we believe about a quantity before any data arrives.',
        };
        case 'transition': return {
            eyebrow: 'Factor node · dynamics', color: INK, title: 'How the hidden state evolves',
            body: 'Describes how the next state follows from the previous state, the control input and the parameters. A factor only talks to the variables it is connected to.',
        };
        case 'likelihood': return {
            eyebrow: 'Factor node · likelihood', color: INK, title: 'How the data is produced',
            body: 'Connects the hidden state to what we can actually measure. This is where observations enter the model.',
        };
        case 'control': return {
            eyebrow: 'Factor node · control prior', color: GOAL, title: 'Which actions are plausible',
            body: 'A prior over the action at this time step. With active inference, goals reshape this belief into a plan.',
        };
        case 'equality': return {
            eyebrow: 'Equality node', color: INK, title: 'One variable, several factors',
            body: 'When a variable is used by more than two factors, an equality node shares it among them, so every edge still connects exactly two nodes.',
        };
        case 'edge': return {
            eyebrow: 'Edge · random variable', color: VAR_COLORS[v] ?? INK, title: <>The variable {label(v)}</>,
            body: 'Every edge is a random variable shared by the two nodes it connects. Messages travel along edges in both directions, each carrying local information.',
        };
        case 'belief': return {
            eyebrow: 'Probability distribution', color: VAR_COLORS[v] ?? INK, title: <>What we know about {label(v)}</>,
            body: 'Our current belief about this variable. A wide shape means we are unsure; as messages arrive it narrows around the most likely values.',
        };
        case 'data': return {
            eyebrow: 'Observation', color: INK, title: 'Measured data',
            body: 'A value we actually observed. Its information flows into the graph as messages and sharpens the beliefs about everything connected to it.',
        };
        case 'goal': return {
            eyebrow: 'Goal', color: GOAL, title: 'Where we want to end up',
            body: 'A preference for future observations. Planning messages flow back from the goal and tell the agent which actions to take; once the future arrives it is replaced by real data.',
        };
    }
}

interface CardProps {
    hit: Hit;
    labels: Record<string, string>;
    terms: string[];
    left: number;
    top: number;
    below: boolean;
    onEnter: () => void;
    onLeave: () => void;
}

export function InfoCard({ hit, labels, terms, left, top, below, onEnter, onLeave }: CardProps) {
    const label = (v: string) => (
        <span className="inline-block" dangerouslySetInnerHTML={{ __html: labels[v] ?? '' }} />
    );
    const it = info(hit, label);
    return (
        <div
            role="tooltip"
            onPointerEnter={onEnter}
            onPointerLeave={onLeave}
            className={`absolute z-20 w-[min(19rem,calc(100%-1.5rem))] -translate-x-1/2 ${below ? '' : '-translate-y-full'}`}
            style={{ left, top }}
        >
            <div className="sg-fade-in overflow-hidden rounded-2xl bg-white/95 text-left shadow-[0_12px_32px_-8px_rgba(15,23,42,0.25)] ring-1 ring-slate-200 backdrop-blur">
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${it.color}, ${it.color}55)` }} />
                <div className="px-4 pb-3 pt-3">
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: it.color }}>
                        <span className="h-2 w-2 rounded-full" style={{ background: it.color }} />
                        {it.eyebrow}
                    </div>
                    <div className="text-[15px] font-semibold leading-snug text-slate-800">{it.title}</div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{it.body}</p>
                    {hit.term !== undefined && hit.term >= 0 && (
                        <div className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[13px] text-slate-700"
                            dangerouslySetInnerHTML={{ __html: terms[hit.term] }} />
                    )}
                    <a href="https://docs.rxinfer.com" target="_blank" rel="noopener noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#087f7e] hover:text-[#0aa8a7] hover:underline">
                        Read more in the docs <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </a>
                </div>
            </div>
        </div>
    );
}
