import { ChapterLayout } from '../../components/layout/ChapterLayout'
import { Flashcard } from '../../components/viz/Flashcard'
import { DotProductWalkthrough } from '../../components/viz/DotProductWalkthrough'
import { MatMulExplorer } from '../../components/viz/MatMulExplorer'
import { SplitCompare } from '../../components/viz/SplitCompare'
import { ShapeExercise } from '../../components/viz/ShapeExercise'
import { PredictReveal } from '../../components/viz/PredictReveal'
import { GpuPairDiagram } from '../../components/viz/GpuPairDiagram'

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
        Every technique later in this site — tensor parallelism, pipeline parallelism, FSDP,
        MoE, AllReduce — ultimately answers one question: <em>we have one big matrix
        multiplication; how do we split it across multiple GPUs, and what do they have to tell
        each other afterward?</em> So before touching GPUs at all, let's build rock-solid
        intuition for matrix multiplication itself, from ordinary arithmetic on up.
      </p>

      <h2>Warm-up: just arithmetic</h2>
      <p>Nothing fancy yet — just multiplying and adding small numbers.</p>
      <div className="note" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Flashcard prompt="3 × 4 =" answer={12} />
        <Flashcard prompt="6 + 7 =" answer={13} />
        <Flashcard prompt="5 × 5 =" answer={25} />
        <Flashcard prompt="8 + 9 =" answer={17} />
      </div>

      <h2>Matrix shapes: the m, k, n rule</h2>
      <p>
        A matrix's <strong>shape</strong> is just its rows × columns. When you multiply A times
        B, three letters describe every shape involved:
      </p>
      <table>
        <thead>
          <tr>
            <th>Letter</th>
            <th>What it counts</th>
            <th>Where it shows up</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>m</td>
            <td>rows of A</td>
            <td>also rows of C</td>
          </tr>
          <tr>
            <td>k</td>
            <td>columns of A, and rows of B</td>
            <td>the shared dimension — must match, or it's invalid</td>
          </tr>
          <tr>
            <td>n</td>
            <td>columns of B</td>
            <td>also columns of C</td>
          </tr>
        </tbody>
      </table>
      <p>
        So A is (m, k), B is (k, n), and C = A @ B is (m, n). The rule to multiply at all: the
        two <code>k</code>'s must be equal. Notice <code>k</code> disappears from C's shape
        entirely — it gets "used up" during the multiplication. Keep that fact in your back
        pocket; it's the seed of everything about splitting later. Try these — figure out m, k,
        n, or whether the shapes even work at all:
      </p>
      <div className="worked-example">
        <h3>A: (2, 8), B: (8, 5)</h3>
        <ShapeExercise a={[2, 8]} b={[8, 5]} />
      </div>
      <div className="worked-example">
        <h3>A: (3, 4), B: (5, 6)</h3>
        <ShapeExercise a={[3, 4]} b={[5, 6]} />
      </div>
      <div className="worked-example">
        <h3>A: (4, 2), B: (2, 6)</h3>
        <ShapeExercise a={[4, 2]} b={[2, 6]} />
      </div>
      <div className="worked-example">
        <h3>A: (5, 3), B: (4, 2)</h3>
        <ShapeExercise a={[5, 3]} b={[4, 2]} />
      </div>

      <h2>What's a dot product?</h2>
      <p>
        Take two lists of numbers that are the same length. Multiply each pair up, then add all
        those products together. That's it — that whole process is called a{' '}
        <strong>dot product</strong>. Try it below.
      </p>
      <div className="worked-example">
        <h3>Dot product of [2, 3] and [4, 5]</h3>
        <DotProductWalkthrough vectorA={[2, 3]} vectorB={[4, 5]} />
      </div>

      <h2>Matrix multiplication is just a grid of dot products</h2>
      <p>
        Here, A is (4, 4), B is (4, 4), so m = k = n = 4 and C is (4, 4) too. Every single cell
        of C is one dot product: <code>C[i][j]</code> = row <code>i</code> of A, dot-producted
        with column <code>j</code> of B. Click any cell of C below and solve it yourself.
      </p>
      <div className="worked-example">
        <h3>C = A @ B</h3>
        <MatMulExplorer a={A} b={B} />
      </div>

      <h2>Splitting the work between two workers</h2>
      <p>
        Now imagine two workers (two GPUs) want to compute C = A @ B together, splitting matrix
        B between them. There are two different ways to cut B in half — by columns, or by rows
        — and they behave completely differently. Worth comparing side by side rather than
        assuming they're the same idea twice.
      </p>
      <p>
        Splitting B <strong>by columns</strong>: give Worker 0 the left half of B's columns,
        Worker 1 the right half. A stays whole for both. Try it below.
      </p>
      <div className="worked-example">
        <h3>Same A and B as above, split across 2 workers</h3>
        <SplitCompare a={A} b={B} />
      </div>

      <p>Before switching to "split B by rows" above, predict this one:</p>
      <div className="note">
        <PredictReveal
          prompt="Worker 0 keeps the whole A (4×4), and just takes the top 2 rows of B (2×4). Will A @ B0 work?"
          options={[
            { label: 'Yes, that works', correct: false },
            { label: 'No, invalid shapes', correct: true },
          ]}
          explanation={
            <>
              A is (4, 4), that top slice of B is (2, 4). The inner dimensions are 4 and 2 — they
              don't match, so this multiplication is undefined. To split B by rows at all, A has
              to be split too — by its columns, into matching (4, 2) pieces. That's exactly what
              the "Split B by rows" mode above does.
            </>
          }
        />
      </div>

      <h3>Column split vs. row split, side by side</h3>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Column split</th>
            <th>Row split</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>What's split</td>
            <td>B only</td>
            <td>B by rows, and A by columns to match</td>
          </tr>
          <tr>
            <td>Each worker's result</td>
            <td>A real, finished slice of C</td>
            <td>Full-shaped, but only a partial sum</td>
          </tr>
          <tr>
            <td>Correct on its own?</td>
            <td>Yes</td>
            <td>No — needs the other worker's piece</td>
          </tr>
          <tr>
            <td>How to combine</td>
            <td>Place side by side</td>
            <td>Add together, elementwise</td>
          </tr>
          <tr>
            <td>Needs data to move between GPUs?</td>
            <td>Yes</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Needs extra arithmetic to combine?</td>
            <td>No</td>
            <td>Yes (but the add itself is trivially cheap)</td>
          </tr>
        </tbody>
      </table>

      <div className="note">
        <PredictReveal
          prompt={
            'True or false: "column-split is free because there\'s no arithmetic — row-split costs more because it needs an addition."'
          }
          options={[
            { label: 'True', correct: false },
            { label: 'False', correct: true },
          ]}
          explanation={
            <>
              Both schemes require the exact same expensive thing: physically moving each
              worker's result from one GPU's memory to another over the network. Whatever you do
              with the data once it arrives — place it side by side, or add it — is essentially
              free by comparison (nanoseconds). The real difference between the two shows up
              later, once you chain many layers together: column-split lets you go several
              operations before you're forced to communicate, while row-split forces a combine
              right there. That's why real tensor-parallel implementations alternate the two —
              covered in the Tensor Parallelism chapter.
            </>
          }
        />
      </div>

      <h2>What this actually looks like on real hardware</h2>
      <p>
        Everything above happened on paper. Here's the same two scenarios, but drawn as two
        actual GPUs — each one continuously running its own little matmul (that grid of squares
        lighting up is standing in for a real tensor core doing multiply-adds), connected by the
        link they have to use to reach each other.
      </p>
      <div className="worked-example">
        <GpuPairDiagram />
      </div>
      <div className="note">
        📸 Keep this picture in your head for every chapter from here on. Almost every
        parallelism technique in this course is this exact scene — a handful of GPUs, each
        crunching its own matmul, linked by an arrow like this one that's sometimes just moving
        data, and sometimes moving data <em>and</em> adding it. When a later chapter says
        "AllReduce" or "communication," picture this.
      </div>

      <p>
        That's the whole math foundation this course needs: shape rules (m, k, n), dot products
        as sum-of-products, and exactly two ways to combine split work — concatenate, or add.
        Nothing later introduces new mathematical machinery; it's all about{' '}
        <em>where data lives and when workers have to talk to each other</em>, built on exactly
        what's above.
      </p>
    </ChapterLayout>
  )
}
