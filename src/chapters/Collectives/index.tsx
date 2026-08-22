import { ChapterLayout } from '../../components/layout/ChapterLayout'
import { Flashcard } from '../../components/viz/Flashcard'
import { PredictReveal } from '../../components/viz/PredictReveal'
import { CollectiveDiagram } from '../../components/viz/CollectiveDiagram'
import { RingAllReduce } from '../../components/viz/RingAllReduce'

const RING_VECTORS = [
  [1, 2, 3, 4],
  [2, 1, 0, 3],
  [0, 2, 2, 1],
  [1, 1, 1, 0],
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

      <h2>Beyond two GPUs</h2>
      <p>
        The add-vs-stitch idea from last chapter didn't only work for two GPUs — it works for any
        number of them. With more GPUs, though, we need names for the exact pattern of "who sends
        what to whom." These patterns are called <strong>collective operations</strong>, and every
        distributed training technique in this course is built from a small, fixed set of them.
        Click "Run" on each one below.
      </p>

      <h3>Broadcast — one rank's data, copied to everyone</h3>
      <div className="worked-example">
        <CollectiveDiagram mode="broadcast" />
      </div>

      <h3>Scatter — one rank's data, split and handed out differently</h3>
      <div className="worked-example">
        <CollectiveDiagram mode="scatter" />
      </div>

      <h3>Gather — everyone's piece, collected at one rank</h3>
      <div className="worked-example">
        <CollectiveDiagram mode="gather" />
      </div>

      <h3>AllGather — everyone's piece, collected and shared back with everyone</h3>
      <div className="worked-example">
        <CollectiveDiagram mode="allgather" />
      </div>

      <h3>Reduce — everyone's value, added together at one rank</h3>
      <div className="worked-example">
        <CollectiveDiagram mode="reduce" />
      </div>

      <h3>AllReduce — everyone's value, added together and shared with everyone</h3>
      <div className="worked-example">
        <CollectiveDiagram mode="allreduce" />
      </div>

      <h3>ReduceScatter — added together, but each rank only keeps its own slice</h3>
      <div className="worked-example">
        <CollectiveDiagram mode="reducescatter" />
      </div>

      <h2>AllReduce, for real: it's ReduceScatter then AllGather</h2>
      <p>
        Here's the part the diagrams above hide: <strong>AllReduce isn't its own primitive.</strong>{' '}
        Real systems build it by chaining ReduceScatter and then AllGather together. Why bother?
        Because sending everything to one hub, summing it there, and fanning it back out — what
        the diagrams above showed — makes that one hub a bandwidth bottleneck. Splitting it into
        two phases lets the work spread across every GPU's link instead of choking one of them.
        Let's do the real math this time, with each GPU holding a 4-number vector instead of a
        single number.
      </p>
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
        The elementwise sum, column by column — this is exactly what ReduceScatter computes,
        it just hands each column's answer to a <em>different</em> GPU instead of computing all
        four somewhere central:
      </p>
      <div className="note" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Flashcard prompt="slot 0: 1 + 2 + 0 + 1 =" answer={4} />
        <Flashcard prompt="slot 1: 2 + 1 + 2 + 1 =" answer={6} />
        <Flashcard prompt="slot 2: 3 + 0 + 2 + 1 =" answer={6} />
        <Flashcard prompt="slot 3: 4 + 3 + 1 + 0 =" answer={8} />
      </div>
      <p>
        After ReduceScatter, no single GPU has all four sums — each one only owns <em>one</em>{' '}
        correct, final slot. Then AllGather's whole job is just to spread those four already-computed
        slots around so every GPU ends up holding all four — that's the "for real" version of the
        AllReduce diagram above, just done as two cheaper, spread-out phases instead of one
        bottlenecked one.
      </p>

      <h2>How this actually happens on the wire: Ring-AllReduce</h2>
      <p>
        The hub-and-spoke picture from every diagram above is the easiest way to <em>understand</em>{' '}
        what these operations compute — but it's not how GPUs are actually wired, and it's not
        what real training frameworks do. Real clusters arrange GPUs in a <strong>ring</strong>,
        where each GPU only ever talks to its two immediate neighbors. Step through the exact same
        four vectors below and watch the real algorithm run — every number here is computed live,
        not hand-picked.
      </p>
      <div className="worked-example">
        <RingAllReduce vectors={RING_VECTORS} />
      </div>
      <p>
        Notice the step count: with 4 GPUs, it takes 3 reduce-scatter steps plus 3 all-gather
        steps — always <code>2 × (N − 1)</code> for N GPUs. Each step only ever moves 1/N of the
        data, no matter how many GPUs are in the ring. That's the entire reason ring-AllReduce
        scales: adding more GPUs doesn't make any single link carry more data, unlike the hub
        picture where the hub's link has to carry everyone's data at once.
      </p>
      <p>
        One more layer real clusters add: <strong>Hierarchical AllReduce.</strong> A cluster isn't
        one big ring — it's nodes (remember local rank vs. global rank?) each holding a handful of
        GPUs connected by a very fast link (like NVLink), while the links <em>between</em> nodes
        are much slower. So real systems AllReduce quickly within each node first, then do one
        slower AllReduce across nodes using just one representative rank per node, then broadcast
        that final result back down to the other local ranks in each node. Same operations you
        already know — Broadcast, AllReduce — just applied at two different levels of the cluster.
      </p>

      <h2>Which one do I need?</h2>
      <p>Given a situation, can you name the right collective? Predict before revealing.</p>
      <div className="note">
        <PredictReveal
          prompt="Every GPU computed its own partial gradient. Every GPU needs the total gradient to update its own weights. Which operation?"
          options={[
            { label: 'Reduce', correct: false },
            { label: 'AllReduce', correct: true },
          ]}
          explanation={
            <>
              Reduce would only give the total to one rank. Every GPU needs its own copy of the
              total to update its own weights — that's AllReduce. (This is exactly what data
              parallelism does with gradients, coming up soon.)
            </>
          }
        />
      </div>
      <div className="note">
        <PredictReveal
          prompt="Rank 0 has the full training dataset and needs to hand a different slice to each GPU. Which operation?"
          options={[
            { label: 'Broadcast', correct: false },
            { label: 'Scatter', correct: true },
          ]}
          explanation={
            <>
              Broadcast would give everyone an identical full copy. Handing out different slices
              is Scatter.
            </>
          }
        />
      </div>
      <div className="note">
        <PredictReveal
          prompt="Each GPU holds a different shard of the model's parameters, and needs the full parameter set temporarily to run a computation. Which operation?"
          options={[
            { label: 'Gather', correct: false },
            { label: 'AllGather', correct: true },
          ]}
          explanation={
            <>
              Gather would assemble the full set at only one rank. Every GPU needs its own full
              copy — that's AllGather. (This is how ZeRO/FSDP temporarily reassembles sharded
              parameters — its own chapter covers this in depth.)
            </>
          }
        />
      </div>
      <div className="note">
        <PredictReveal
          prompt="You only need the sum of everyone's values at one central logging rank — no one else needs it. Which operation?"
          options={[
            { label: 'Reduce', correct: true },
            { label: 'AllReduce', correct: false },
          ]}
          explanation={
            <>
              AllReduce would needlessly send the sum to every rank. If only one rank actually
              needs it, plain Reduce does the same job for less communication.
            </>
          }
        />
      </div>

      <p>
        That's the full vocabulary this course runs on: rank, local rank, global rank, world
        size, and the seven collective operations above. Every chapter from here — data
        parallelism, ZeRO/FSDP, tensor parallelism, pipeline parallelism, MoE — is really just:
        which of these operations gets used, on what data, and how often. Keep this chapter, and
        last chapter's two-GPU picture, in mind as the mental model underneath all of it.
      </p>
    </ChapterLayout>
  )
}
