import { ChapterLayout } from '../../components/layout/ChapterLayout'
import { Flashcard } from '../../components/viz/Flashcard'
import { DotProductWalkthrough } from '../../components/viz/DotProductWalkthrough'
import { MatMulExplorer } from '../../components/viz/MatMulExplorer'
import { SplitCompare } from '../../components/viz/SplitCompare'

const A = [
  [1, 2, 1, 2],
  [2, 1, 2, 1],
  [1, 1, 2, 2],
  [2, 2, 1, 1],
]

const B = [
  [1, 0, 1, 1],
  [0, 1, 1, 0],
  [1, 1, 0, 1],
  [1, 0, 1, 0],
]

export function MathPrerequisites() {
  return (
    <ChapterLayout slug="math-prerequisites">
      <p>
        Everything later in this site is built out of one operation: multiplying matrices
        together. That sounds intimidating, but it's really just a lot of ordinary arithmetic —
        multiplying and adding — done over and over in a pattern. Let's build it up from
        scratch, a piece at a time, so nothing later ever feels like it came out of nowhere.
      </p>

      <h2>Warm-up: just arithmetic</h2>
      <p>Nothing fancy yet — just multiplying and adding small numbers.</p>
      <div className="note" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Flashcard prompt="3 × 4 =" answer={12} />
        <Flashcard prompt="6 + 7 =" answer={13} />
        <Flashcard prompt="5 × 5 =" answer={25} />
        <Flashcard prompt="8 + 9 =" answer={17} />
      </div>

      <h2>What's a dot product?</h2>
      <p>
        Take two lists of numbers that are the same length. Multiply each pair up, then add all
        those products together. That's it — that whole process is called a{' '}
        <strong>dot product</strong>. Try it below: multiply each pair, then add the results.
      </p>
      <div className="worked-example">
        <h3>Dot product of [2, 3] and [4, 5]</h3>
        <DotProductWalkthrough vectorA={[2, 3]} vectorB={[4, 5]} />
      </div>

      <h2>Matrix multiplication is just a grid of dot products</h2>
      <p>
        A matrix is just a grid of numbers. When you multiply matrix A by matrix B, every single
        cell of the answer is one dot product: take a <em>row</em> from A, take a{' '}
        <em>column</em> from B (same length as the row), and dot-product them. Click any cell of
        C below and solve it yourself.
      </p>
      <div className="worked-example">
        <h3>C = A @ B</h3>
        <MatMulExplorer a={A} b={B} />
      </div>

      <h2>Splitting the work between two workers</h2>
      <p>
        Now imagine two workers (two GPUs, say) want to compute C = A @ B together, each doing
        half the work. The obvious way to split the job is to give each worker half of matrix B
        — but there are two different ways to cut B in half: <strong>by columns</strong>, or{' '}
        <strong>by rows</strong>. Here's why that choice actually matters, and why it's worth
        comparing them side by side instead of assuming they behave the same way.
      </p>
      <p>
        Imagine you and a friend are asked: "how many apples were sold this week across 4 fruit
        stands?" If you split the job <strong>by stand</strong> — you count stands 1 and 2, your
        friend counts stands 3 and 4 — you each walk away with a finished number. You just place
        both numbers side by side. But if you split the job <strong>by day</strong> — you count
        Monday and Tuesday across all 4 stands, your friend counts Wednesday and Thursday — then
        neither of you has a real answer for any stand on its own. You'd have to talk to each
        other and add your numbers together before either number means anything.
      </p>
      <p>
        Splitting B <strong>by columns</strong> is like splitting by stand: each worker's piece
        turns out to already be complete. Splitting B <strong>by rows</strong> is like splitting
        by day: each worker ends up with a partial, incomplete result — and the two workers have
        to add their results together before anyone has the real answer. Try both below —
        actually attempt to combine them the same way each time, and watch what happens.
      </p>
      <div className="worked-example">
        <h3>Same A and B as above, split across 2 workers</h3>
        <SplitCompare a={A} b={B} />
      </div>
      <p>
        That "try to combine, discover it's wrong, then add instead" step — the thing
        row-splitting forces on you — is exactly what a real distributed training system calls{' '}
        <strong>AllReduce</strong>. You've already understood the core idea behind it.
      </p>
    </ChapterLayout>
  )
}
