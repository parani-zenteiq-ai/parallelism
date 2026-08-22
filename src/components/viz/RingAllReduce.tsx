import { useMemo, useState } from 'react'
import { simulateRingAllReduce } from './ringAllReduce'
import './RingAllReduce.css'

interface RingAllReduceProps {
  vectors: number[][]
  size?: number
}

export function RingAllReduce({ vectors, size = 340 }: RingAllReduceProps) {
  const trace = useMemo(() => simulateRingAllReduce(vectors), [vectors])
  const [pointer, setPointer] = useState(-1)

  const n = trace.n
  const center = size / 2
  const radius = size * 0.34

  const positions = useMemo(() => {
    return Array.from({ length: n }, (_, i) => {
      const angle = -90 + (360 / n) * i
      const rad = (angle * Math.PI) / 180
      return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) }
    })
  }, [n, center, radius])

  const edges = useMemo(() => {
    return positions.map((p, i) => {
      const next = positions[(i + 1) % n]
      const dx = next.x - p.x
      const dy = next.y - p.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI
      return { x: p.x, y: p.y, length, angle }
    })
  }, [positions, n])

  const currentState: (number | null)[][] =
    pointer === -1 ? vectors.map((v) => [...v]) : trace.steps[pointer].state
  const currentStep = pointer === -1 ? null : trace.steps[pointer]
  const activeSends = currentStep ? currentStep.sends : null

  const totalSteps = trace.steps.length

  return (
    <div className="ring-allreduce">
      <div className="ring-canvas" style={{ width: size, height: size }}>
        {edges.map((e, i) => (
          <div
            key={i}
            className="ring-edge"
            style={{ left: e.x, top: e.y, width: e.length, transform: `rotate(${e.angle}deg)` }}
          >
            {activeSends && (
              <div key={pointer} className="ring-pulse" />
            )}
          </div>
        ))}

        {positions.map((p, i) => (
          <div key={i} className="ring-gpu" style={{ left: p.x, top: p.y }}>
            <div className="ring-gpu-label">GPU {i}</div>
            <div className="ring-gpu-slots">
              {currentState[i].map((v, slot) => {
                const isSending = activeSends ? activeSends[i] === slot : false
                const isConfirmed = v !== null && v === trace.trueSum[slot]
                const cls = isSending
                  ? 'ring-slot sending'
                  : isConfirmed
                    ? 'ring-slot confirmed'
                    : v !== null
                      ? 'ring-slot partial'
                      : 'ring-slot'
                return (
                  <div key={slot} className={cls}>
                    {v === null ? '–' : v}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="ring-controls">
        <button onClick={() => setPointer((p) => Math.max(-1, p - 1))} disabled={pointer === -1}>
          ← Prev
        </button>
        <div className="ring-step-label">
          {pointer === -1
            ? 'Start — everyone only knows their own vector'
            : `${currentStep!.phase === 'reduce-scatter' ? 'Reduce-Scatter' : 'AllGather'} — step ${currentStep!.stepIndex + 1} of ${currentStep!.totalStepsInPhase}`}
        </div>
        <button
          onClick={() => setPointer((p) => Math.min(totalSteps - 1, p + 1))}
          disabled={pointer === totalSteps - 1}
        >
          Next →
        </button>
      </div>

      <div className="ring-caption">
        {pointer === -1 &&
          'Each GPU holds its own full vector — nobody has the sum for anything yet. Step forward to watch the ring pass slices around.'}
        {currentStep?.phase === 'reduce-scatter' &&
          'Every GPU sends one slice to its neighbor, who adds it in. After 3 steps, each GPU owns the true, fully-summed value for exactly one slot (highlighted).'}
        {currentStep?.phase === 'all-gather' &&
          "Now each GPU's fully-summed slot travels around the ring so everyone ends up with all four slots — the complete sum."}
      </div>
    </div>
  )
}
