# Parallelism — LLM Training Parallelism Teaching Site

Public, interactive teaching site explaining LLM training parallelism (data, ZeRO/FSDP, tensor,
pipeline, sequence/context, MoE/expert parallelism) from fundamentals up. React + Vite + TS,
deployed eventually to Vercel/Netlify.

**Project framing**: a month-long learning project (not one week — corrected 2026-08-15).
Quality is non-negotiable; Paranidharan wants to genuinely impress frontier labs and would
rather post slowly, chapter by chapter as he actually learns each concept, than rush breadth. As
of 2026-08-15 the near-term focus is `math-prerequisites` only — resist the urge to move on to
other chapters just because 9 more exist as placeholders in the registry. Paranidharan (and his
co-author) are learning this material themselves and uploading it in their own words as they go
— this is not a ghost-written reference site. **Audience is school-level** — no assumed ML/PhD
background, no assumed hands-on experience. Content must build up genuinely from scratch,
including basic math prerequisites before any parallelism concept: what matrix multiplication
is, dot products, arithmetic — so a reader never feels lost. Keep this bar in mind for any
future chapter work: prefer adding a prerequisite/math-primer step over assuming a reader
already knows it.

## Critical constraint — read this first

**Do not write chapter content on your own initiative — only build what's been explicitly
designed.** Paranidharan is learning this material himself and wants to design/drive the
teaching approach for each chapter — sometimes by literally pasting a transcript of how he
worked through a concept (e.g. a Socratic back-and-forth) and asking for it to be turned into an
interactive page. When that happens, build it — that *is* an explicit ask. What you should not
do is invent chapter explanations or push a chapter from placeholder to "done" without him having
driven the content/pedagogy first. `math-prerequisites` (see below) is built this way and is the
reference example. The other 9 chapters still render only `<p>Content coming soon.</p>` inside
`ChapterLayout` — leave them alone until he brings the same kind of concrete direction.

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
- `math_preq.md` (repo root) — raw source material for the Math Prerequisites chapter: a
  Socratic tutoring transcript plus pedagogy notes, uploaded by Paranidharan. This is the pattern
  going forward: he/his co-author drop a raw notes/transcript file, and the chapter gets built
  from that content (expanded/organized, not invented) rather than from scratch. Expect similar
  files for later chapters.
- `src/chapters/MathPrerequisites/index.tsx` — the first real (non-placeholder) chapter, built
  from `math_preq.md`, and the template for how content chapters should be built: prose + inline
  interactive components, not prose alone. Reusable primitives in `src/components/viz/`:
  - `Flashcard.tsx` — type-an-answer-or-reveal quiz card (used for every arithmetic step)
  - `DotProductWalkthrough.tsx` — sequential flashcards for each pairwise product, then a sum
    flashcard, then a reveal
  - `MatMulExplorer.tsx` — clickable A/B/C grid (classic schoolbook layout: B above, A to the
    left, C in the corner); clicking a C cell launches a `DotProductWalkthrough` for that row/
    column pair and fills the cell in once solved
  - `ShapeExercise.tsx` — given two matrix shapes, quizzes m/k/n via `Flashcard` if valid, or a
    `PredictReveal` valid/invalid check if not — the (m, k, n) shape-rule drill
  - `PredictReveal.tsx` — generic predict-then-reveal: pick an option, always see the
    explanation after. Used for every "common misconception" moment (the row-split shape
    mismatch, the communication-vs-arithmetic cost misconception) — commit to an answer before
    seeing the correction, don't just read a callout
  - `SplitCompare.tsx` + `MatrixView.tsx` — toggles between column-splitting B (each worker's
    piece is already complete — placing them together needs zero extra arithmetic, but data
    still has to move between GPUs either way) and splitting B by rows with A split to match
    (each worker gets a full-shaped but partial result; the reveal flow makes you *try* placing
    them side by side first, see it's wrong — all cells mismatch — before adding instead, which
    is what AllReduce does). Don't say "no communication needed" for column-split anywhere — that
    was a real mistake caught against `math_preq.md`; communication is required in both schemes,
    only the arithmetic differs. `matrixUtils.ts` has the plain matrix math (`multiply`, `add`,
    `sliceCols`, `sliceRows`, `column`) backing all of this — verified by hand against a Node
    script before committing, since a wrong worked example on a teaching site is worse than no
    example.
  Reuse these primitives for later chapters' math/mechanism walkthroughs rather than one-off
  components — e.g. pipeline-parallel bubble math or ZeRO memory arithmetic could reuse
  `Flashcard`/`PredictReveal`.
- `src/index.css` — global theme tokens (CSS custom properties), light/dark via
  `prefers-color-scheme`. Palette is a warm paper/near-black "frontier lab" look — serif
  headlines (`--serif-font`) + sans body + monospace uppercase kickers (`--code-font`).

## Content outline (for when chapter authoring resumes)

Teaching order, defined in `registry.ts` (reordered 2026-08-19): Math Prerequisites → **Ranks,
World Size & AllReduce** (slug `collectives`) → Why Parallelism → Data Parallelism → ZeRO/FSDP →
Tensor Parallelism → Pipeline Parallelism → Sequence/Context Parallelism → Expert Parallelism
(MoE) → Putting It Together. Deliberately reordered so the rank/local-rank/world-size vocabulary
and a formalized AllReduce come right after Math Prerequisites, *before* the motivational "Why
Parallelism" chapter — Paranidharan wants the full vocabulary and mental model locked in first,
then the payoff/motivation chapter after. `collectives` is still a placeholder — its title/
summary were updated to reflect this new plan, but no content has been authored yet; wait for a
notes file the same way `math_preq.md` seeded `math-prerequisites`. Math Prerequisites
(arithmetic, dot products, matrix multiplication, plus a two-GPU hardware visualization) is
chapter 1 because the audience is school-level with no assumed math/ML background — every later
chapter should assume only what's taught there, not outside knowledge. Full plan with
per-chapter notes is in `~/.claude/plans/zazzy-dreaming-ripple.md` (may not exist in a fresh
environment — treat the outline above and in `registry.ts` as authoritative if that file is
gone).

## Open items / pending from the owner

- Both authors' bios are filled in on the home page (`src/components/Authors.tsx`) — Paranidharan
  (ZenteiQ.ai, TPU-scale LLM training, ex-IISc/IBM Granite collaboration) and Pinakin Choudary
  (IISc math & computing B.Tech, ZenteiQ.ai distributed training clusters). No open item here
  unless he asks for changes.
- **Memory arithmetic** (weights/gradients/optimizer-state byte math, section 5 of
  `math_preq.md`) was deliberately deferred out of `math-prerequisites` — it'll likely surface
  again as its own chapter or folded into ZeRO/FSDP, where memory sharding is the actual point.
- Deployment (Vercel/Netlify) hasn't been connected yet — build output is untested against a
  host; `npm run build` output alone has been verified.
