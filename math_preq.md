# Chapter 1: Math Prerequisites (Session Notes)

> Purpose of this file: raw teaching content + pedagogy notes from a Socratic
> tutoring session, written so an agent (e.g. Claude Code) can turn it into an
> **interactive** page — like the "Warm-up: just arithmetic" style page shown
> in the reference screenshot (inline check boxes, "Check" / "Show answer"
> buttons) — rather than a wall of text to read.
>
> Audience level: assume **zero** prior linear algebra. Explain like you're
> teaching a smart school kid who has never seen a matrix. No jargon without
> a plain-English translation first.

---

## 0. Why this chapter exists

Every distributed training technique in this course (tensor parallelism,
pipeline parallelism, FSDP, MoE, AllReduce, AllGather...) is ultimately about
one question:

> **"We have one big matrix multiplication. How do we split it across
> multiple GPUs, and what do the GPUs have to tell each other afterward?"**

So before touching GPUs at all, we need rock-solid intuition for:
1. What matrix multiplication actually *does* (not just "the algorithm," but
   *why* each output number is what it is).
2. What happens when you split one of the input matrices before multiplying.
3. That splitting always ends in one of exactly two outcomes: **stitch
   pieces together (concatenate)**, or **add pieces together (sum)** — and
   there is no third option.

This file is the "solid ground" chapter. Nothing later should feel like it
came out of nowhere.

---

## 1. Matrix multiplication basics — the `m, k, n` notation

Two matrices:

```
A: shape (m, k)
B: shape (k, n)
C = A @ B: shape (m, n)
```

Plain-English meaning of each letter:

| Letter | What it counts | Where it appears |
|---|---|---|
| `m` | rows of `A` | also becomes rows of `C` |
| `k` | columns of `A` **and** rows of `B` | the "shared" / "inner" dimension — must match between `A` and `B`, or the multiply is invalid |
| `n` | columns of `B` | also becomes columns of `C` |

**The rule to multiply:** the *inner* dimensions must match. `A` is `(m, k)`,
`B` is `(k, n)` — the two `k`'s must be equal. If they aren't, the
multiplication is undefined — full stop, not "less accurate," just invalid.

**The most important thing to internalize:** `k` **disappears** in the
output. `C`'s shape is `(m, n)` — no `k` anywhere. `k` is a dimension that
gets "used up" / "summed away" during the multiplication. This single fact
is the seed of everything about row-splitting vs column-splitting later.

**Interactive exercise idea for the site** (like the screenshot's arithmetic
warm-up):
- Give 4–5 pairs of shapes, e.g. `A: (2,8), B: (8,5)` → ask user to fill in
  `m`, `k`, `n`, and the shape of `C`. Check + Show Answer buttons.
- Include at least one **invalid** pair (e.g. `A: (3,4), B: (5,6)`) and ask
  "valid or invalid, and why?" — this catches a common blind spot (people
  assume any two matrices can multiply).

---

## 2. What's a dot product?

Take two lists (vectors) of numbers **of the same length**. Multiply each
matching pair, then add all those products together. That single number is
the dot product.

Example: dot product of `[2, 3]` and `[4, 5]`:
```
2 × 4 = 8
3 × 5 = 15
8 + 15 = 23
```

**Why this matters:** matrix multiplication is *nothing more than* doing a
dot product over and over, once for every (row of A, column of B) pair.
There is no additional trick beyond this.

---

## 3. Matrix multiplication is just a grid of dot products

Formal definition, using indices `i`, `j`, `k`:

```
C[i][j] = sum over k of ( A[i][k] * B[k][j] )
```

Plain English: to get the entry at row `i`, column `j` of `C`, take **row
`i` of A** and **column `j` of B**, multiply them elementwise, and add up
all the products — that's exactly the dot product from Section 2, just
applied row-by-row and column-by-column to fill in every cell of `C`.

**Concrete worked example** (good candidate for a fully worked, static
example on the site, followed by an interactive one where the user fills in
cells):

```
A = [[1, 2],       B = [[5, 6],
     [3, 4]]            [7, 8]]

C[0][0] = (1×5) + (2×7) = 5 + 14 = 19
C[0][1] = (1×6) + (2×8) = 6 + 16 = 22
C[1][0] = (3×5) + (4×7) = 15 + 28 = 43
C[1][1] = (3×6) + (4×8) = 18 + 32 = 50

C = [[19, 22],
     [43, 50]]
```

**Interactive exercise idea:** give `A` and `B` as small 2×2 or 3×3 grids,
ask the user to compute one or two cells of `C` at a time, "Check" button
per cell. Optionally animate: highlight row `i` of A and column `j` of B
lighting up together when computing `C[i][j]`.

---

## 4. Splitting the work between two workers

This is the actual seed of **tensor parallelism**. Everything here was
derived step-by-step in the session, including the mistakes made along the
way — worth preserving because the "wrong turn" is often the most
instructive part for a learner encountering this fresh.

### Setup

```
A: shape (m, k)
B: shape (k, n)
C = A @ B: shape (m, n)
```

We keep `A` and `B` as inputs, and we want to split the **work** of
computing `C` across two workers (Worker 1, Worker 2), each doing part of
the computation. Question: split along which dimension, and what happens
after?

### 4.1 Column-split (split `B` along `n`)

Give Worker 1 the left half of `B`'s columns → `B0`, shape `(k, n/2)`.
Give Worker 2 the right half → `B1`, shape `(k, n/2)`.
**`A` stays whole — both workers get the full `A`.**

- Worker 1 computes `A @ B0` → shape `(m, n/2)`.
- Worker 2 computes `A @ B1` → shape `(m, n/2)`.

Each worker's result is a **different, non-overlapping slice of columns of
the true `C`** — not an approximation, not partial info, an actual finished
chunk of the real answer.

**To combine:** place the two `(m, n/2)` results **side by side** along the
column dimension → get back the full `(m, n)` `C`. This is called
**concatenation**.

Common misconception to flag explicitly on the site: *"concatenation is
free, no communication needed."* **False.** If the two results live in two
different workers' memory (two different GPUs), you still have to move
bytes across the network to bring them together (or to hand them to whoever
needs `C` next). The only thing that's free is the *arithmetic* — there is
none, you're just placing values next to each other, not adding anything.
Communication (data movement) is required in *both* schemes described here.

### 4.2 Row-split (split `B` along `k`, and split `A` along its columns too)

This is the harder case — it's *not* "the same idea applied to rows,"
because a naive row-split immediately breaks the shape rule.

**First wrong instinct to preserve on the site (this is a genuinely useful
teaching moment):** "just give Worker 1 the whole `A` and the top half of
`B`'s rows." Let's check if that's even valid:

- `A` is `(m, k)`.
- `B0` (top half of B's rows) is `(k/2, n)`.
- `A @ B0` → inner dimensions are `k` and `k/2`. **These don't match unless
  k/2 = k, which is false.** Invalid multiplication. This doesn't work.

**Correct approach:** `A` must *also* be split — along its **columns** (its
`k` dimension) — into `A0` (left half, shape `(m, k/2)`) and `A1` (right
half, shape `(m, k/2)`), matching `B`'s row-split into `B0` `(k/2, n)` and
`B1` `(k/2, n)`.

- Worker 1 computes `A0 @ B0` → `(m, k/2) @ (k/2, n) = (m, n)`.
- Worker 2 computes `A1 @ B1` → `(m, k/2) @ (k/2, n) = (m, n)`.

**Both results come out the same full shape `(m, n)` as the true `C` — but
neither one is correct on its own.** Why? Go back to the dot-product
definition:

```
C[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + ... + A[i][k-1]*B[k-1][j]
        = sum over ALL k terms
```

Worker 1's `A0 @ B0` only had access to the *first half* of the `k`
indices, so it computed only the *first half of the terms* in that sum.
Worker 2 computed the other half of the terms. **Each worker's `(m,n)`
result is a partial sum — same shape as the answer, but literally missing
half the terms that should be added into every cell.**

**To combine:** take Worker 1's `(m,n)` result and Worker 2's `(m,n)`
result and add them together, **elementwise** (cell 0,0 of Worker 1 + cell
0,0 of Worker 2 = true cell 0,0 of C, and so on for every cell). This
elementwise-add-across-workers pattern, where every worker holds a
full-shaped-but-incomplete result, is the exact intuition behind the
**AllReduce** collective operation (formalized in a later chapter).

### 4.3 Side-by-side comparison

| | Column-split `B` | Row-split `B` (+ column-split `A`) |
|---|---|---|
| What's split | `B` only, along `n` | `B` along `k`, **and** `A` along `k` |
| Each worker's result shape | `(m, n/2)` — a slice of `C` | `(m, n)` — full shape, but incomplete |
| Is each worker's result "correct" on its own? | Yes — a real finished piece of `C` | No — a partial sum, needs the other worker's piece added |
| How to combine | Concatenate (stitch side by side) | Add elementwise (sum) |
| Does combining require moving data across GPUs? | **Yes** | **Yes** |
| Does combining require arithmetic? | No | Yes (but the arithmetic itself is computationally trivial) |

### 4.4 The one big misconception to correct explicitly on the site

> "Concatenation is free because it's not arithmetic; addition costs more
> because it's arithmetic."

**This is wrong, and it's worth a dedicated callout box on the site.** The
expensive part in *both* schemes is the exact same thing: **physically
moving data from one GPU's memory to another GPU's over the network.**
Whatever you do with the data *after* it arrives — concatenate it or add
it — is computationally free (nanoseconds), regardless of which scheme you
picked. The real difference between the two schemes only shows up **later**,
once you chain many layers together — column-split lets you chain
several operations before you're forced to communicate, while row-split
forces a combine step at that specific point. (That's *why* real tensor
parallelism implementations alternate column-split and row-split layers —
covered in the Tensor Parallelism chapter, not here.)

**Suggested interactive element:** a toggle/animation: "drag result from
GPU 1 → combine point" and "drag result from GPU 2 → combine point," same
animation for both concat and add, so the learner *sees* that the data-
movement step is visually identical in both cases, and only the little
"+"" vs "stitch" icon at the end differs.

---

## 5. Memory arithmetic (adjacent topic covered same session — optional to include in this chapter or move to a "Memory" chapter)

For a model with **1 billion parameters**:

**All in FP32 (4 bytes per number):**
- Weights: `1,000,000,000 × 4 bytes = 4 GB`
- Gradients: same shape as weights → `4 GB`
- Optimizer states (Adam: momentum `m` + variance `v`, both same shape as
  weights) → `8 GB`
- **Total: 16 GB**, just from these three categories (activations not
  included).

**Key distinction (gradients vs optimizer states) — a place where the
learner initially blurred the line:**

| | Gradient | Optimizer state (e.g. Adam's `m`, `v`) |
|---|---|---|
| Shape | Same shape as the weights | Same shape as the weights |
| Lifecycle | **Transient** — computed fresh every step, used once, can be discarded after the update | **Persistent** — carried forward from step to step, updated (not replaced) each time |
| What it represents | "If I nudge this weight, does loss go up or down, and by how much, right now" | A running history — momentum (average of past gradients) and variance (average of past squared gradients) |

**Naive FP16-everywhere case** (a simplification, flagged as not fully
realistic):
- Weights: `2 GB`, Gradients: `2 GB`, Optimizer states: `4 GB` → naive total
  `8 GB`.
- **Reality check for the site to include as a callout:** real
  mixed-precision training usually keeps an **FP32 master copy** of weights
  and FP32 optimizer states even when the actual compute happens in
  FP16/BF16, to avoid numerical instability. So real memory footprint is
  often much closer to the FP32 total than the naive halved number — this
  nuance deserves its own worked example in the Memory chapter, not fully
  resolved here.

---

## 6. Self-assessment: strengths vs. confusion points (for the site's "you are here" progress tracker)

**Solid / confirmed via correct answers without help:**
- Identifying the four+one core memory consumers (weights, gradients,
  optimizer states, activations, input data) — got this immediately and
  fully correctly.
- Memory arithmetic for FP32 and FP16 (multiplying params × bytes,
  Adam's 2x multiplier for m+v) — computed correctly, twice, unprompted.
- `m, k, n` shape rules once explained — applied correctly to a fresh
  example (`(2,8) @ (8,5) → (2,5)`) on the first try after correction.
- Column-split intuition (independent computation, concatenate to combine)
  — correct on first attempt.
- Final synthesis of row-split (partial sums, need elementwise add,
  connects back to sum-over-k dot product definition) — got there
  correctly through guided questioning.

**Needed correction / initial confusion (worth building explicit practice
exercises around on the site):**
- **Gradient vs. optimizer state**: initially described both in vague
  "helps model learn" language without the transient-vs-persistent
  distinction. Corrected via explicit lifecycle framing.
- **Row-split naive attempt**: first instinct was "both workers can
  independently compute results," without checking whether `A @ B0` is
  even dimensionally valid. Needed to be walked through the shape-mismatch
  check explicitly (`4×4 @ 2×4` invalid) before realizing `A` also needs
  splitting.
- **`m, k, n` labeling**: first attempt mixed up which letter belongs to
  which matrix (said `A: (m,n)`, `C: (k,n)` — swapped `k` and `n`'s roles).
  Corrected with the explicit `(m,k)@(k,n)=(m,n)` template repeated against
  concrete numbers.
- **Cost model misconception**: believed concatenation requires *no* data
  movement at all (fully free), only realized after direct questioning that
  concatenation also needs data to move across GPUs — only the arithmetic
  is free, not the communication. This is flagged above (Section 4.4) as a
  priority callout box for the site.

**Recommendation for the interactive site:** put a short "predict before
you check" question at each of these four points, mirroring how the
correction happened live in this session — i.e., ask the *same* trap
question this learner (and probably most learners) will initially get
wrong, before revealing the correct framing.

---

## 7. Is the math foundation sufficient to proceed?

**Yes.** For everything ahead in this course (AllReduce/AllGather formalized
on real GPUs, tensor parallelism, GSPMD, ZeRO/FSDP), no additional linear
algebra is required beyond what's in this chapter:
- Shape rules (`m, k, n`)
- Dot product as sum-of-products
- The two combine outcomes: concatenate or add — there is no third option
- Basic memory arithmetic (params × bytes × multiplier)

Everything from here forward is about **data placement, shapes across
devices, and communication patterns** — not new mathematical machinery.
When a new formula appears later (e.g. `communication time ≈ latency +
size/bandwidth`), it should get the same treatment: explained physically,
every variable defined, a tiny numerical example, before any generalization.

**Not yet covered — flag as upcoming, not missing from this chapter:**
- Activations in depth (how memory scales with batch size / sequence
  length) — deliberately deferred to the Memory chapter.
- Basic distributed systems vocabulary (process, rank, node, device) —
  needed before AllReduce chapter, not covered yet.
- AllReduce / AllGather / ReduceScatter formalized with real 4-GPU examples
  — the next planned chapter, directly building on Section 4 above.

---

## 8. Notes for the implementing agent (Claude Code)

- Match the interaction style in the reference screenshot: short prose
  block → inline exercise card with an input field, "Check" button, "Show
  answer" link (not immediately visible).
- Prefer **many small checks** over few large ones — e.g. one exercise per
  cell of `C` rather than one exercise for the whole matrix.
- Every place a "common misconception" is flagged above, render it as an
  explicit predict-then-reveal question, not a passive callout — the
  learner should commit to an answer before seeing the correction.
- Keep prose extremely short per screen — this learner has explicitly
  asked for low text density and high interactivity; err toward shorter
  blocks with more inline widgets over longer explanatory paragraphs.
- Use consistent notation throughout the whole site: always `(m, k)`,
  `(k, n)`, `(m, n)`, and `C[i][j]`, `A[i][k]`, `B[k][j]` — never switch
  letter conventions between chapters.
