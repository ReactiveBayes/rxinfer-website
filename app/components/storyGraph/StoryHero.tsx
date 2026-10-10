import katex from 'katex';
import { LABEL_TEX, TERMS } from './geometry';
import StoryHeroClient from './StoryHeroClient';

// Landing animation: probabilistic model -> factor graph -> message passing -> active inference.
// Adapted from the BIASlab introduction animation originally created by Wouter Kouw.
// Math is typeset at build time, so the client only needs the KaTeX stylesheet and fonts.
const tex = (s: string) => katex.renderToString(s, { throwOnError: false, output: 'html' });

export default function StoryHero() {
    return (
        <StoryHeroClient
            terms={TERMS.map(t => tex(t.tex))}
            lhs={tex('p(y,\\, x,\\, u,\\, \\theta)\\;=')}
            times={tex('\\times')}
            posterior={tex(
                'p(x,\\, u,\\, \\theta\\,|\\,y) \\;=\\; \\dfrac{p(y,\\, x,\\, u,\\, \\theta)}' +
                '{\\iiint p(y,\\, x,\\, u,\\, \\theta)\\;\\mathrm{d}x\\, \\mathrm{d}u\\, \\mathrm{d}\\theta}',
            )}
            labels={Object.fromEntries(Object.entries(LABEL_TEX).map(([k, v]) => [k, tex(v)]))}
        />
    );
}
