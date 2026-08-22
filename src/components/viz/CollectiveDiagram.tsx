import { useMemo, useState } from 'react'
import { DeviceNode } from './DeviceNode'
import './CollectiveDiagram.css'

export type CollectiveMode =
  | 'broadcast'
  | 'scatter'
  | 'gather'
  | 'allgather'
  | 'reduce'
  | 'allreduce'
  | 'reducescatter'

interface ModeConfig {
  hubIcon: string
  inbound: boolean
  outbound: boolean
  initial: string[]
  final: string[]
  caption: string
}

const PIECES = ['🟦', '🟩', '🟨', '🟥']
const VALUES = [1, 2, 3, 4]
const SUM = VALUES.reduce((a, b) => a + b, 0)

function buildConfig(mode: CollectiveMode): ModeConfig {
  switch (mode) {
    case 'broadcast':
      return {
        hubIcon: '📡',
        inbound: false,
        outbound: true,
        initial: [PIECES[0], '—', '—', '—'],
        final: [PIECES[0], PIECES[0], PIECES[0], PIECES[0]],
        caption:
          "Rank 0's data goes out to everyone. Now every rank holds an identical copy.",
      }
    case 'scatter':
      return {
        hubIcon: '📡',
        inbound: false,
        outbound: true,
        initial: [PIECES.join(''), '—', '—', '—'],
        final: [...PIECES],
        caption:
          "Rank 0's data is split into pieces — each rank receives a different piece.",
      }
    case 'gather':
      return {
        hubIcon: '⧉',
        inbound: true,
        outbound: false,
        initial: [...PIECES],
        final: [PIECES.join(''), PIECES[1], PIECES[2], PIECES[3]],
        caption:
          "Everyone's distinct piece flows to rank 0, which assembles them. Only rank 0 ends up with the full picture — everyone else still just has their own piece.",
      }
    case 'allgather':
      return {
        hubIcon: '⧉',
        inbound: true,
        outbound: true,
        initial: [...PIECES],
        final: Array(4).fill(PIECES.join('')),
        caption:
          'Same as Gather, but the assembled full set is sent back out to everyone — now every rank has the complete picture.',
      }
    case 'reduce':
      return {
        hubIcon: 'Σ',
        inbound: true,
        outbound: false,
        initial: VALUES.map(String),
        final: [String(SUM), String(VALUES[1]), String(VALUES[2]), String(VALUES[3])],
        caption: `Everyone's value flows in and gets added together — the total (${SUM}) ends up only at rank 0. Everyone else still just has their own original value.`,
      }
    case 'allreduce':
      return {
        hubIcon: 'Σ',
        inbound: true,
        outbound: true,
        initial: VALUES.map(String),
        final: Array(4).fill(String(SUM)),
        caption: `Same as Reduce, but the sum (${SUM}) is sent back to everyone — now every rank holds the identical total. This is the same AllReduce from the two-GPU picture last chapter, just with more GPUs.`,
      }
    case 'reducescatter':
      return {
        hubIcon: 'Σ',
        inbound: true,
        outbound: true,
        initial: ['4-part data', '4-part data', '4-part data', '4-part data'],
        final: ['slice 0 of sum', 'slice 1 of sum', 'slice 2 of sum', 'slice 3 of sum'],
        caption:
          "Everyone's data gets added together like AllReduce — but instead of handing the whole sum to everyone, each rank only receives its own slice of it. The real numbers are just below.",
      }
  }
}

interface CollectiveDiagramProps {
  mode: CollectiveMode
  size?: number
}

export function CollectiveDiagram({ mode, size = 300 }: CollectiveDiagramProps) {
  const [ranByMode, setRanByMode] = useState<Record<string, boolean>>({})
  const [animating, setAnimating] = useState(false)

  const config = useMemo(() => buildConfig(mode), [mode])
  const hasRun = !!ranByMode[mode]

  const center = size / 2
  const deviceRadius = size * 0.36
  const deviceCount = 4

  const devices = useMemo(() => {
    return Array.from({ length: deviceCount }, (_, i) => {
      const angle = -90 + (360 / deviceCount) * i
      const rad = (angle * Math.PI) / 180
      return {
        x: center + deviceRadius * Math.cos(rad),
        y: center + deviceRadius * Math.sin(rad),
        angle,
      }
    })
  }, [center, deviceRadius])

  const labels = hasRun ? config.final : config.initial

  function run() {
    if (animating) return
    setAnimating(true)
    window.setTimeout(() => {
      setRanByMode((prev) => ({ ...prev, [mode]: true }))
      setAnimating(false)
    }, 1300)
  }

  function reset() {
    setRanByMode((prev) => ({ ...prev, [mode]: false }))
  }

  return (
    <div className="collective-diagram">
      <div className="collective-canvas" style={{ width: size, height: size }}>
        <div className="collective-hub">{animating ? config.hubIcon : hasRun ? config.hubIcon : ''}</div>

        {devices.map((d, i) => (
          <div key={i}>
            <div
              className="collective-track"
              style={{
                width: deviceRadius,
                left: center,
                top: center,
                transform: `rotate(${d.angle}deg)`,
              }}
            >
              {animating && config.inbound && (
                <div className="collective-pulse inbound" style={{ animationDelay: `${i * 0.06}s` }} />
              )}
              {animating && config.outbound && (
                <div
                  className="collective-pulse outbound"
                  style={{ animationDelay: `${(config.inbound ? 0.65 : 0) + i * 0.06}s` }}
                />
              )}
            </div>
            <DeviceNode label={`D${i}`} x={d.x} y={d.y} active={hasRun} />
            <div
              className="collective-label"
              style={{ left: d.x, top: d.y + 40 }}
            >
              {labels[i]}
            </div>
          </div>
        ))}
      </div>

      <div className="collective-controls">
        <button onClick={run} disabled={animating}>
          {hasRun ? 'Run again' : 'Run'}
        </button>
        {hasRun && (
          <button className="collective-reset" onClick={reset}>
            Reset
          </button>
        )}
      </div>

      <div className="collective-caption">{config.caption}</div>
    </div>
  )
}
