'use client'

import { Fragment, KeyboardEvent, RefObject, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

export const STEPS = [
    {
        title: 'Probabilistic model',
        caption: 'Describe how your data could have been generated, as a product of small, simple pieces.',
    },
    {
        title: 'Factor graph',
        caption: 'Every piece becomes a node, every shared variable an edge.',
    },
    {
        title: 'Message passing',
        caption: 'Observations enter the graph, nodes exchange local messages, and beliefs sharpen.',
    },
    {
        title: 'Active inference',
        caption: 'Add goals for the future: plan by message passing, act, observe, and repeat.',
    },
];

interface Props {
    target: number;
    onSelect: (i: number) => void;
    tabRefs: RefObject<(HTMLButtonElement | null)[]>;
    underlineRef: RefObject<HTMLSpanElement | null>;
}

export default function StepBar({ target, onSelect, tabRefs, underlineRef }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Keep the active tab in view when the bar scrolls horizontally (phones).
    useEffect(() => {
        const scroller = scrollRef.current, tab = tabRefs.current[target];
        if (!scroller || !tab || scroller.scrollWidth <= scroller.clientWidth) return;
        const sr = scroller.getBoundingClientRect(), tr = tab.getBoundingClientRect();
        scroller.scrollTo({
            left: scroller.scrollLeft + (tr.left - sr.left) - (scroller.clientWidth - tr.width) / 2,
            behavior: 'smooth',
        });
    }, [target, tabRefs]);

    const onKeyDown = (e: KeyboardEvent) => {
        const next = { ArrowRight: (target + 1) % 4, ArrowLeft: (target + 3) % 4, Home: 0, End: 3 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        onSelect(next);
        tabRefs.current[next]?.focus();
    };

    return (
        <div className="w-full">
            <div ref={scrollRef} className="sg-no-scrollbar overflow-x-auto">
                <div role="tablist" aria-label="How RxInfer works" onKeyDown={onKeyDown}
                    className="relative mx-auto flex w-max items-center gap-1 px-2 pb-3 md:gap-2">
                    {STEPS.map((step, i) => {
                        const active = i === target;
                        return (
                            <Fragment key={step.title}>
                                {i > 0 && <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-gray-300" />}
                                <button
                                    ref={el => { tabRefs.current[i] = el; }}
                                    role="tab"
                                    id={`story-tab-${i}`}
                                    aria-selected={active}
                                    aria-controls="story-scene"
                                    tabIndex={active ? 0 : -1}
                                    onClick={() => onSelect(i)}
                                    className={`flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0aa8a7]/60 md:px-3 md:text-base ${active ? 'text-[#087f7e]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs transition-colors duration-300 ${active ? 'border-[#0aa8a7] bg-[#0aa8a7] text-white' : 'border-gray-300'}`}>
                                        {i + 1}
                                    </span>
                                    <span className="whitespace-nowrap">{step.title}</span>
                                </button>
                            </Fragment>
                        );
                    })}
                    <span ref={underlineRef} aria-hidden
                        className="absolute bottom-1 left-0 h-[3px] w-0 rounded-full bg-gradient-to-r from-[#0aa8a7] to-[#2f6fde]" />
                </div>
            </div>
            <p key={target} aria-live="polite"
                className="sg-fade-in mx-auto mt-1 min-h-[4.5em] max-w-3xl px-4 text-center text-[15px] leading-normal text-gray-600 md:min-h-[1.5em] md:text-lg">
                {STEPS[target].caption}
            </p>
        </div>
    );
}
