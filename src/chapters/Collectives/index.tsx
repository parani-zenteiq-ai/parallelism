import { ChapterLayout } from '../../components/layout/ChapterLayout'
import { Flashcard } from '../../components/viz/Flashcard'
import { PredictReveal } from '../../components/viz/PredictReveal'
import { CollectiveDiagram } from '../../components/viz/CollectiveDiagram'
import { RingAllReduce } from '../../components/viz/RingAllReduce'
import { FlowEquation } from '../../components/viz/FlowEquation'
import { ReduceScatterDiagram } from '../../components/viz/ReduceScatterDiagram'
import { AllGatherDiagram } from '../../components/viz/AllGatherDiagram'
import { ZoomNarrative } from '../../components/viz/ZoomNarrative'

const RING_VECTORS = [
  [1, 10, 100, 1000],
  [2, 20, 200, 2000],
  [3, 30, 300, 3000],
  [4, 40, 400, 4000],
]

export function Collectives() {
  return (
    <ChapterLayout slug="collectives">
      <p>
        Last chapter, two GPUs either stitched their results together or added them. Real
        training runs use hundreds or thousands of GPUs — so we need a shared vocabulary for
        "which GPU is which," and standard operations for "how GPUs exchange data."
      </p>

      <h2>One more bit of arithmetic first: division with a remainder</h2>
      <p>
        Imagine seating people into rows of 8 seats each, numbering people starting from 0. Person
        number 13 — which row are they in, and which seat in that row? Count off 8, that's row 0
        full; the next 5 people (8, 9, 10, 11, 12, 13 — wait, let's just say person 13) start row
        1. So: how many <em>whole</em> groups of 8 fit into 13, and what's left over? That's all
        division-with-remainder is.
      </p>
      <div className="note" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Flashcard prompt="13 ÷ 8 — whole groups of 8 that fit =" answer={1} />
        <Flashcard prompt="13 ÷ 8 — what's left over =" answer={5} />
        <Flashcard prompt="19 ÷ 8 — whole groups of 8 that fit =" answer={2} />
        <Flashcard prompt="19 ÷ 8 — what's left over =" answer={3} />
      </div>

      <h2>Process, rank, world size</h2>
      <p>
        Every GPU in a training run has one program running on it — that's called a{' '}
        <strong>process</strong> (or <strong>worker</strong>). Each process gets a unique ID
        called its <strong>rank</strong>, counting from 0. The total number of processes is the{' '}
        <strong>world size</strong>. If you have 32 GPUs total, world size is 32, and ranks run
        from 0 to 31.
      </p>
      <p>
        GPUs are physically grouped into machines, called <strong>nodes</strong> — say 8 GPUs per
        node. That gives every GPU two different addresses: its <strong>local rank</strong> (0-7,
        its position within its own node) and its <strong>global rank</strong> (0-31, its position
        across the whole cluster). And now the arithmetic from above pays off:
      </p>
      <table>
        <thead>
          <tr>
            <th>To find</th>
            <th>From</th>
            <th>Formula</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>global rank</td>
            <td>node id, local rank</td>
            <td>node_id × gpus_per_node + local_rank</td>
          </tr>
          <tr>
            <td>node id</td>
            <td>global rank, gpus_per_node</td>
            <td>global_rank ÷ gpus_per_node (whole groups)</td>
          </tr>
          <tr>
            <td>local rank</td>
            <td>global rank, gpus_per_node</td>
            <td>global_rank ÷ gpus_per_node (the leftover)</td>
          </tr>
        </tbody>
      </table>
      <p>Try it — 8 GPUs per node throughout:</p>
      <div className="worked-example">
        <h3>Node 2, local rank 3 → global rank?</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Flashcard prompt="global rank =" answer={19} />
        </div>
      </div>
      <div className="worked-example">
        <h3>Global rank 19 → which node, which local rank?</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Flashcard prompt="node id =" answer={2} />
          <Flashcard prompt="local rank =" answer={3} />
        </div>
      </div>
      <div className="worked-example">
        <h3>Global rank 5 → which node, which local rank?</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Flashcard prompt="node id =" answer={0} />
          <Flashcard prompt="local rank =" answer={5} />
        </div>
      </div>

      <div className="part-divider">
        <div className="part-kicker">Part 2</div>
        <h2 className="part-title">ALL REDUCE</h2>
      </div>

      <div className="worked-example">
        <FlowEquation parts={['Reduce-Scatter', 'All-Gather']} result="AllReduce" />
      </div>
      <p>That's the whole intuition. Everything below just unpacks these three pieces, one at a time.</p>

      <div className="note warn">
        ⚠️ <strong>Where most people trip up:</strong> "AllReduce," and "how it actually runs on
        the wire" (the ring algorithm, further down) are two different things — an operation and
        an algorithm that implements it. Learn them separately, don't blur them together.
      </div>

      <h3>ReduceScatter</h3>
      <p>Everyone starts with a full vector. Each GPU ends up owning one already-summed slot.</p>
      <div className="worked-example">
        <ReduceScatterDiagram vectors={RING_VECTORS} />
      </div>

      <h3>AllGather</h3>
      <p>Everyone starts with a different piece. Everyone ends up with all the pieces — no arithmetic.</p>
      <div className="worked-example">
        <AllGatherDiagram ringVectors={RING_VECTORS} />
      </div>

      <h3>AllReduce in action</h3>
      <p>Chain the two operations above and this is what you get — the whole thing, at once:</p>
      <div className="worked-example">
        <CollectiveDiagram mode="allreduce" />
      </div>

      <h3>How this runs across many real GPUs</h3>
      <p>
        That diagram above works — but everyone reporting to GPU 0 has a cost. Count the messages:
      </p>
      <div className="note" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Flashcard prompt="4 GPUs — GPU 0 total messages =" answer={6} />
        <Flashcard prompt="4 GPUs — a leaf's total messages =" answer={2} />
        <Flashcard prompt="16 GPUs — GPU 0 total messages =" answer={30} />
        <Flashcard prompt="16 GPUs — a leaf's total messages =" answer={2} />
      </div>
      <p>
        3× the work at 4 GPUs, 15× at 16. GPU 0 becomes the bottleneck everyone waits on — this is
        why the diagram above is never used at real scale.
      </p>
      <p>
        Real systems arrange GPUs in a <strong>ring</strong> instead — every GPU only ever talks to
        its two neighbors, one message in and one out, every step, regardless of how many GPUs
        exist. But there's a trap:
      </p>
      <div className="note">
        <PredictReveal
          prompt="4 GPUs hold 1, 2, 3, 4. Every round, each GPU forwards its current running total (not a chunk — the whole thing) to its neighbor, who adds it in. After 3 rounds, does GPU 0 hold the correct total, 10?"
          options={[
            { label: 'Yes, 10', correct: false },
            { label: 'No — something else', correct: true },
          ]}
          explanation={
            <>
              GPU 0 ends up with <strong>24</strong>. [5,3,5,7] → [12,8,8,12] → [24,20,16,20] —
              whole totals re-circle and get folded in more than once. The fix: never forward a
              running total, only ever forward one specific, well-defined <strong>chunk</strong> —
              that's what actually prevents double-counting.
            </>
          }
        />
      </div>
      <p>Step through the real, chunked version — every number below is computed live, not hand-picked:</p>
      <div className="worked-example">
        <RingAllReduce vectors={RING_VECTORS} />
      </div>
      <p>
        <code>2 × (N − 1)</code> steps, 1/N of the data each step, for any N. No GPU's workload
        grows as the cluster grows — that's the whole reason it scales.
      </p>

      <p>
        You now know what AllReduce is, and how it actually moves across real GPUs. Last check —
        do you know when it fires, and on what, during an actual training step?
      </p>
      <h3>When does AllReduce actually fire during training?</h3>
      <div className="note">
        <PredictReveal
          prompt="Plain data parallelism, no sharding. Which of these does AllReduce actually touch: weights, activations, or gradients?"
          options={[
            { label: 'Weights', correct: false },
            { label: 'Activations', correct: false },
            { label: 'Gradients', correct: true },
          ]}
          explanation={
            <>
              Weights start identical on every GPU and every GPU applies the same averaged
              update, so they need no extra synchronization to stay identical. Activations are
              local intermediate values from each GPU's own slice of data — never meant to be
              shared. Gradients are the odd one out: each GPU computes them independently from{' '}
              <em>different</em> data, so they genuinely differ across GPUs and must be combined
              before the shared weight update — otherwise every GPU would drift onto different
              weights.
            </>
          }
        />
      </div>
      <div className="note">
        <PredictReveal
          prompt="How many times does AllReduce fire during one training step?"
          options={[
            { label: 'Once, after the whole backward pass finishes', correct: false },
            { label: 'Once per layer/tensor, as each gradient finishes', correct: true },
          ]}
          explanation={
            <>
              Backward pass computes gradients layer by layer, from the output layer toward the
              input layer. As soon as one layer's gradient is fully computed, its AllReduce can
              launch immediately — overlapping with the still-ongoing backward computation of
              earlier layers. That overlap (communication hidden behind ongoing compute) is a
              real performance optimization real systems rely on, not just a detail.
            </>
          }
        />
      </div>

      <h2>Putting it all together: from one neuron to the network of GPUs</h2>
      <p>
        Everything in this chapter has been about one connection, one weight, at a time. Here's
        the whole picture, zoomed through three levels — the network you're training, the GPU
        computing one piece of it, and the ring of GPUs talking to each other to keep every copy
        in sync.
      </p>
      <div className="worked-example">
        <ZoomNarrative />
      </div>

      <p>
        That's the full vocabulary this course runs on: rank, local rank, global rank, world
        size, AllReduce, and its two constituent operations, ReduceScatter and AllGather. Every
        chapter from here — data parallelism, ZeRO/FSDP, tensor parallelism, pipeline parallelism,
        MoE — is really just: which of these operations gets used, on what data, and how often.
        Keep this chapter, and last chapter's two-GPU picture, in mind as the mental model
        underneath all of it.
      </p>
    </ChapterLayout>
  )
}
