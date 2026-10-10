'use client'

import { KeyboardEvent, RefObject } from 'react';
import { Crosshair, LucideIcon, Sigma, Waypoints, Workflow } from 'lucide-react';

export const STEPS: { title: string; icon: LucideIcon; caption: string }[] = [
    {
        title: 'Probabilistic model',
        icon: Sigma,
        caption: 'Describe how your data could have been generated, as a product of small, simple pieces.',
    },
    {
        title: 'Factor graph',
        icon: Workflow,
        caption: 'Every piece becomes a node, every shared variable an edge.',
    },
    {
        title: 'Message passing',
        icon: Waypoints,
        caption: 'Observations enter the graph, nodes exchange local messages, and beliefs sharpen.',
    },
    {
        title: 'Active inference',
        icon: Crosshair,
        caption: 'Add goals for the future: plan by message passing, act, observe, and repeat.',
    },
];

interface Props {
    target: number;
    onSelect: (i: number) => void;
    tabRefs: RefObject<(HTMLButtonElement | null)[]>;
    thumbRef: RefObject<HTMLSpanElement | null>;
}

// Segmented control. The white thumb is positioned every frame by the animation loop, so it
// glides along with the story instead of jumping to the selected step.
export default function StepBar({ target, onSelect, tabRefs, thumbRef }: Props) {
    const onKeyDown = (e: KeyboardEvent) => {
        const next = { ArrowRight: (target + 1) % 4, ArrowLeft: (target + 3) % 4, Home: 0, End: 3 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        onSelect(next);
        tabRefs.current[next]?.focus();
    };

    return (
        <div className="w-full">
            <div className="flex justify-center px-2">
                <div role="tablist" aria-label="How RxInfer works" onKeyDown={onKeyDown}
                    className="relative flex items-center gap-0.5 rounded-full bg-slate-100/80 p-1 ring-1 ring-inset ring-slate-200/80">
                    <span ref={thumbRef} aria-hidden
                        className="absolute inset-y-1 left-0 w-0 rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_6px_16px_-4px_rgba(10,168,167,0.35)] ring-1 ring-[#0aa8a7]/25" />
                    {STEPS.map((step, i) => {
                        const active = i === target;
                        const Icon = step.icon;
                        return (
                            <button
                                key={step.title}
                                ref={el => { tabRefs.current[i] = el; }}
                                role="tab"
                                id={`story-tab-${i}`}
                                aria-selected={active}
                                aria-controls="story-scene"
                                aria-label={step.title}
                                title={step.title}
                                tabIndex={active ? 0 : -1}
                                onClick={() => onSelect(i)}
                                className={`relative z-10 flex items-center rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0aa8a7]/60 md:px-4 md:text-[15px] ${active ? 'text-[#087f7e]' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                <Icon aria-hidden strokeWidth={2.2}
                                    className={`h-4 w-4 shrink-0 transition-colors duration-300 ${active ? 'text-[#0aa8a7]' : ''}`} />
                                {/* on phones only the active step shows its name */}
                                <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 md:ml-2 md:max-w-[12rem] md:opacity-100 ${active ? 'ml-2 max-w-[12rem] opacity-100' : 'max-w-0 opacity-0'}`}>
                                    {step.title}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <p key={target} aria-live="polite"
                className="sg-fade-in mx-auto mt-4 min-h-[4.5em] max-w-3xl px-4 text-center text-[15px] leading-normal text-gray-600 md:min-h-[1.5em] md:text-lg">
                {STEPS[target].caption}
            </p>
        </div>
    );
}
