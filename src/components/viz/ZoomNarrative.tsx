import { useState } from 'react'
import { RingAllReduce } from './RingAllReduce'
import './ZoomNarrative.css'

const RING_VECTORS = [
  [1, 2, 3, 4],
  [2, 1, 0, 3],
  [0, 2, 2, 1],
  [1, 1, 1, 0],
]

const INPUTS = [
  { x: 40, y: 70 },
  { x: 40, y: 130 },
]
const HIDDEN = [
  { x: 150, y: 40 },
  { x: 150, y: 100 },
  { x: 150, y: 160 },
]
const OUTPUT = { x: 260, y: 100 }

const HIGHLIGHT_FROM = HIDDEN[1]
const HIGHLIGHT_TO = OUTPUT

const STAGES = [
  {
    title: 'A tiny neural network, training',
    caption:
      "Every line here is a weight. Every weight needs a gradient computed for it, and an update applied to it, every single training step. Let's zoom into one connection — the highlighted one.",
  },
  {
    title: 'Zoom in: one connection is one multiply-add, on a GPU',
    caption:
      "That highlighted line is one number, sitting inside a matrix, on some GPU's memory. Computing it is exactly the dot product from Chapter 1 — a row of inputs, multiplied against a column of weights, added up — done by the GPU's tensor cores, over and over, for every connection at once.",
  },
  {
    title: 'Zoom out: that GPU has to talk to the others',
    caption:
      "After the backward pass, this GPU has its own gradient for that exact weight — but so does every other GPU, computed from different data. Before anyone can update the weight, those gradients have to be combined. This is the same ring-AllReduce from a moment ago, just now happening for one real weight in the network above, and for every other weight, every single step.",
  },
]

export function ZoomNarrative() {
  const [stage, setStage] = useState(0)

  return (
    <div className="zoom-narrative">
      <div className="zoom-stage-label">
        Stage {stage + 1} / {STAGES.length} — {STAGES[stage].title}
      </div>

      <div className="zoom-panel">
        {stage === 0 && (
          <svg viewBox="0 0 300 200" className="zoom-network">
            {INPUTS.map((from, i) =>
              HIDDEN.map((to, j) => (
                <line
                  key={`i${i}h${j}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className="zoom-edge"
                />
              )),
            )}
            {HIDDEN.map((from, j) => (
              <line
                key={`h${j}o`}
                x1={from.x}
                y1={from.y}
                x2={OUTPUT.x}
                y2={OUTPUT.y}
                className={from === HIGHLIGHT_FROM ? 'zoom-edge highlight' : 'zoom-edge'}
              />
            ))}
            {INPUTS.map((n, i) => (
              <circle key={`i${i}`} cx={n.x} cy={n.y} r={10} className="zoom-neuron" />
            ))}
            {HIDDEN.map((n, i) => (
              <circle key={`h${i}`} cx={n.x} cy={n.y} r={10} className="zoom-neuron" />
            ))}
            <circle cx={OUTPUT.x} cy={OUTPUT.y} r={10} className="zoom-neuron" />
            <text x={(HIGHLIGHT_FROM.x + HIGHLIGHT_TO.x) / 2} y={HIGHLIGHT_FROM.y - 12} className="zoom-callout">
              ↳ zooming into this one
            </text>
          </svg>
        )}

        {stage === 1 && (
          <div className="zoom-chip">
            <div className="zoom-chip-label">GPU 0</div>
            <div className="zoom-chip-grid">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="zoom-chip-cell" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <div className="zoom-chip-eq">weight = Σ (input × previous-layer output)</div>
          </div>
        )}

        {stage === 2 && <RingAllReduce vectors={RING_VECTORS} size={300} />}
      </div>

      <p className="zoom-caption">{STAGES[stage].caption}</p>

      <div className="zoom-controls">
        <button onClick={() => setStage((s) => Math.max(0, s - 1))} disabled={stage === 0}>
          ← Zoom out
        </button>
        <button
          onClick={() => setStage((s) => Math.min(STAGES.length - 1, s + 1))}
          disabled={stage === STAGES.length - 1}
        >
          Zoom in →
        </button>
      </div>
    </div>
  )
}
