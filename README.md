# RxInfer Website

This is a implementation of the [RxInfer website](https://rxinfer.com) using Next.js.

## Site development

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Landing animation

The interactive hero animation (probabilistic model → factor graph → message passing → active
inference) lives in `app/components/storyGraph/`. It is a JavaScript/canvas adaptation of the
BIASlab introduction animation originally designed and written (in Python) by Wouter Kouw.
`geometry.ts` holds the graph layout (transposed on phones), `choreography.ts` the reversible
transitions and looping message-passing / active-inference timelines, and `draw.ts` the
rendering. Math is typeset with KaTeX at build time.

## Site deployment

The site is deployed automatically when a PR is merged into `main`.
