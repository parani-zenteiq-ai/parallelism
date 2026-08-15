# Parallelism — LLM Training Parallelism Teaching Site

Public, interactive teaching site explaining LLM training parallelism (data, ZeRO/FSDP, tensor,
pipeline, sequence/context, MoE/expert parallelism) from fundamentals up. React + Vite + TS,
deployed eventually to Vercel/Netlify.

**Project framing**: a one-week learning project. Paranidharan (and his co-author) are learning
this material themselves and uploading it in their own words as they go — this is not a
ghost-written reference site. **Audience is school-level** — no assumed ML/PhD background, no
assumed hands-on experience. Content must build up genuinely from scratch, including basic math
prerequisites before any parallelism concept: what matrix multiplication is, dot products,
arithmetic — so a reader never feels lost. Keep this bar in mind for any future chapter work:
prefer adding a prerequisite/math-primer step over assuming a reader already knows it.

## Critical constraint — read this first

**Do not write chapter content (the parallelism explanations) unless explicitly asked.** The
site owner (Paranidharan) has his own ideas for how each chapter should be taught and wants to
design/write the interactive explanations himself, in his own understanding, as he learns the
material. Only build template/scaffolding/tooling — layout, nav, routing, viz component
primitives, theming — until he asks for actual chapter content. All 9 chapter pages currently
render only `<p>Content coming soon.</p>` inside the shared `ChapterLayout` — that's
intentional, not unfinished work to "complete" on your own initiative.

## Stack & commands

- React 19 + TypeScript + Vite 8, React Router 7 (client-side routing, no SSR)
- `npm run dev` — dev server (was running in background on port 5173 at handoff time; if not
  running, start it with `npm run dev -- --port 5173` in the background)
- `npm run build` — `tsc -b && vite build`, must pass with zero TS errors before considering
  anything "done"
- `npx tsc --noEmit -p tsconfig.app.json` — quick type-check without emitting
- Git repo is initialized locally (not yet pushed to a remote)

## Structure

- `src/chapters/registry.ts` — single source of truth for the 10 chapters (slug, order, title,
  summary) plus `nextChapter`/`prevChapter` helpers. Add a chapter here first, then create its
  route in `src/App.tsx` and folder in `src/chapters/<Name>/index.tsx`.
- `src/chapters/<ChapterName>/index.tsx` — one folder per chapter, wraps content in
  `ChapterLayout`, passing only `slug` (order/title are looked up from the registry — don't
  hardcode them in the chapter component, that's how they drifted out of sync before). Currently
  all placeholders.
- `src/chapters/Home.tsx` — landing page: hero, `<Authors />` section, chapter TOC.
- `src/components/layout/NavSidebar.tsx` — left sidebar nav, chapter list driven by `registry.ts`.
- `src/components/layout/ChapterLayout.tsx` — shared chapter shell (kicker, title, prev/next nav).
- `src/components/Authors.tsx` — author bio cards, rendered on the home page (there is no
  separate `/about` route — it was intentionally folded into Home).
- `src/components/viz/` — reusable visualization primitives. `DeviceNode.tsx` (a single device
  box) and `FlowRing.tsx` (devices arranged in a ring, pulses looping continuously around a
  circular track via CSS `offset-path`, with play/pause + speed + device-count controls) exist
  as validated prototypes — this looping/interactive/animated-by-default style is the confirmed
  visual language for the whole site (see memory: feedback-viz-style). Extend/reuse these rather
  than inventing a new visual language per chapter.
- `src/pages/Playground.tsx` (route `/playground`, linked at the bottom of the sidebar) — a
  standalone page for previewing/iterating on viz primitives outside of any real chapter.
- `src/index.css` — global theme tokens (CSS custom properties), light/dark via
  `prefers-color-scheme`. Palette is a warm paper/near-black "frontier lab" look — serif
  headlines (`--serif-font`) + sans body + monospace uppercase kickers (`--code-font`).

## Content outline (for when chapter authoring resumes)

Teaching order, defined in `registry.ts`: Math Prerequisites → Why Parallelism → Hardware &
Collectives Primer → Data Parallelism → ZeRO/FSDP → Tensor Parallelism → Pipeline Parallelism →
Sequence/Context Parallelism → Expert Parallelism (MoE) → Putting It Together. Math
Prerequisites (arithmetic, dot products, matrix multiplication) was added as chapter 1 because
the audience is school-level with no assumed math/ML background — every later chapter should
assume only what's taught there, not outside knowledge. Full plan with per-chapter notes is in
`~/.claude/plans/zazzy-dreaming-ripple.md` (may not exist in a fresh environment — treat the
outline above and in `registry.ts` as authoritative if that file is gone).

## Open items / pending from the owner

- **Co-author**: a friend co-authors this site but their name/links haven't been provided yet.
  `src/components/Authors.tsx` has a placeholder card ("Co-author" / "Bio coming soon.") — fill
  in once given a name and something to verify it against (don't invent details).
- **Paranidharan's bio**: may get an update adding specifics about where he spends most of his
  real-world time (leaning toward the TPU side) — expect a follow-up edit to `Authors.tsx`.
- Deployment (Vercel/Netlify) hasn't been connected yet — build output is untested against a
  host; `npm run build` output alone has been verified.
