import { ChapterLayout } from '../../components/layout/ChapterLayout'
import { Flashcard } from '../../components/viz/Flashcard'
import { PredictReveal } from '../../components/viz/PredictReveal'
import { CollectiveDiagram } from '../../components/viz/CollectiveDiagram'
import { RingAllReduce } from '../../components/viz/RingAllReduce'
import { FlowEquation } from '../../components/viz/FlowEquation'
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
        Last chapter you saw two GPUs split a matrix multiplication and either stitch their
        results together or add them. Real training runs use dozens, hundreds, even thousands of
        GPUs — so we need a shared vocabulary for "which GPU is which," and a small family of
        standard operations for "how groups of GPUs exchange data," so nobody has to invent this
        from scratch every time. That's this whole chapter.
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
      <p>
        The row-split idea from last chapter — two workers, each with a partial sum, forced to
        add their pieces together — is the seed of everything below. Real training runs use
        dozens, hundreds, even thousands of GPUs, all needing to combine partial results the same
        way. This part goes deep on exactly how, for real, not just the shape of the idea.
      </p>

      <h3>Why can't we just pick one GPU to collect everything?</h3>
      <p>
        Before the clever solution, let's try the obvious one and see it break. 4 GPUs, each
        holding one number — everyone sends their value to GPU 0, GPU 0 adds them all up, then
        sends the total back out to everyone.
      </p>
      <div className="worked-example">
        <CollectiveDiagram mode="allreduce" />
      </div>
      <p>Count the messages each GPU actually sends and receives, for this specific naive scheme:</p>
      <div className="note" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Flashcard prompt="GPU 0 (the hub) — total messages sent + received =" answer={6} />
        <Flashcard prompt="GPU 1 (a leaf) — total messages sent + received =" answer={2} />
      </div>
      <p>Now the same cluster, but 16 GPUs instead of 4, same naive scheme:</p>
      <div className="note" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Flashcard prompt="The hub — total messages sent + received =" answer={30} />
        <Flashcard prompt="A leaf — total messages sent + received =" answer={2} />
      </div>
      <p>
        At 4 GPUs the hub does 3× the work of a leaf. At 16 GPUs, it's 15×. The leaf's workload
        never changes — but the hub's grows with every GPU you add, until it's the bottleneck the
        entire system waits on. This is why the naive "everyone report to GPU 0" scheme is
        essentially never used once a cluster gets big.
      </p>

      <h3>Ring AllReduce: the real mechanism</h3>
      <p>
        Arrange the GPUs in a circle instead. Every GPU only ever talks to its two neighbors —
        never a central hub. At every step of the whole algorithm, every GPU sends exactly one
        message and receives exactly one message. No GPU is ever more loaded than any other,
        no matter how many GPUs are in the ring.
      </p>
      <p>
        There's one detail that makes this actually work, and it's easy to trip over: GPUs don't
        pass around their <em>whole running total</em> — they pass around <strong>chunks</strong>.
        Each GPU's data is split into one chunk per GPU in the ring, and only specific individual
        chunks travel around at a time. Here's why that matters — predict what happens without it:
      </p>
      <div className="note">
        <PredictReveal
          prompt="4 GPUs hold 1, 2, 3, 4. Every round, each GPU forwards its current running total to its neighbor, who adds it in — no chunking, just the whole number, round after round. After 3 rounds (matching the real algorithm's step count), does GPU 0 end up holding the correct total, 10?"
          options={[
            { label: 'Yes, 10', correct: false },
            { label: 'No — something else', correct: true },
          ]}
          explanation={
            <>
              GPU 0 ends up with <strong>24</strong>, not 10. Round by round: [5,3,5,7] → [12,8,8,12]
              → [24,20,16,20]. Because whole totals get re-added as they circle around, the same
              original values get folded into the sum more than once. Chunking is exactly what
              prevents this: instead of forwarding an ever-growing mixture, each GPU only ever
              forwards one specific, well-defined chunk, so nothing is ever added in twice.
            </>
          }
        />
      </div>

      <h3>The real worked example</h3>
      <p>Each GPU now holds a 4-number vector (one slot per GPU in the ring) instead of one number:</p>
      <table>
        <thead>
          <tr>
            <th>GPU</th>
            <th>slot 0</th>
            <th>slot 1</th>
            <th>slot 2</th>
            <th>slot 3</th>
          </tr>
        </thead>
        <tbody>
          {RING_VECTORS.map((row, i) => (
            <tr key={i}>
              <td>GPU {i}</td>
              {row.map((v, j) => (
                <td key={j}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Step through the real algorithm below — every number is computed live from these vectors,
        not hand-picked. Watch how, after the reduce-scatter phase, each GPU ends up owning exactly
        one slot that's fully correct (like being handed one finished puzzle piece — nobody has
        the whole picture yet, but every piece that exists is already complete). Then all-gather
        just relays those finished pieces around until everyone has all four.
      </p>
      <div className="worked-example">
        <RingAllReduce vectors={RING_VECTORS} />
      </div>
      <p>
        Notice the step count: 3 reduce-scatter steps, then 3 all-gather steps — always{' '}
        <code>2 × (N − 1)</code> for N GPUs, and each step moves only 1/N of the data. Compare
        that to the naive scheme, where the hub's workload kept growing with N. Here, no GPU's
        workload grows at all — that's the entire reason this scales.
      </p>

      <h3>ReduceScatter and AllGather are their own operations</h3>
      <p>
        These two aren't just "the internal steps of AllReduce" — they're independently useful,
        used on their own (not chained together) elsewhere in distributed training. That's worth
        sitting with, because it's exactly what unlocks ZeRO/FSDP later.
      </p>
      <p>
        <strong>AllGather, standalone:</strong> everyone starts with a genuinely different piece
        (not a partial sum — just different data), and ends up with all the pieces, no arithmetic
        involved at all:
      </p>
      <div className="worked-example">
        <CollectiveDiagram mode="allgather" />
      </div>
      <p>
        <strong>ReduceScatter, standalone:</strong> everyone starts with a full-length vector, and
        ends up owning just one already-summed slot of the total — same operation as the first
        phase above, useful entirely on its own whenever you don't need the full sum everywhere,
        just each rank's own slice of it:
      </p>
      <div className="worked-example">
        <CollectiveDiagram mode="reducescatter" />
      </div>
      <p>When you need both halves — everyone gets the full combined result — you chain them:</p>
      <div className="worked-example">
        <FlowEquation parts={['Reduce-Scatter', 'All-Gather']} result="AllReduce" />
      </div>

      <h3>Bridge to ZeRO / FSDP</h3>
      <div className="note">
        <PredictReveal
          prompt="True or false: ZeRO and FSDP are the same thing?"
          options={[
            { label: 'True', correct: false },
            { label: 'False', correct: true },
          ]}
          explanation={
            <>
              ZeRO is the general idea (from the DeepSpeed paper), with three progressively more
              aggressive stages — ZeRO-1, ZeRO-2, ZeRO-3. FSDP is PyTorch's specific
              implementation of it, and corresponds specifically to ZeRO-3 (sharding parameters,
              gradients, <em>and</em> optimizer states — the most aggressive stage). ZeRO-1 and
              ZeRO-2 are less aggressive relatives, not the same thing as FSDP. Their own chapter
              covers this properly — this is just enough to recognize the names later.
            </>
          }
        />
      </div>
      <p>
        One line to hold onto until then: plain data parallelism needs the <em>full</em> AllReduce
        because every GPU permanently keeps a full copy of everything. ZeRO/FSDP deliberately use
        the two halves <em>separately</em> instead — AllGather to temporarily reconstruct a full
        tensor when needed, ReduceScatter to keep only one gradient shard afterward — because the
        entire point of ZeRO/FSDP is that no GPU wants to permanently hold the full thing anymore.
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
