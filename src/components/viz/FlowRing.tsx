import { useMemo, useState } from 'react'
import { DeviceNode } from './DeviceNode'
import './FlowRing.css'

interface FlowRingProps {
  deviceCount?: number
  size?: number
}

export function FlowRing({ deviceCount = 4, size = 280 }: FlowRingProps) {
  const [count, setCount] = useState(deviceCount)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)

  const center = size / 2
  const deviceRadius = size * 0.36
  const trackRadius = deviceRadius

  const devices = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = -90 + (360 / count) * i
      const rad = (angle * Math.PI) / 180
      return {
        label: `D${i}`,
        x: center + deviceRadius * Math.cos(rad),
        y: center + deviceRadius * Math.sin(rad),
      }
    })
  }, [count, center, deviceRadius])

  const pulses = useMemo(() => Array.from({ length: count }), [count])
  const duration = 6 / speed

  return (
    <div className="flow-ring">
      <div
        className={playing ? 'flow-ring-canvas' : 'flow-ring-canvas paused'}
        style={{ width: size, height: size, ['--duration' as string]: `${duration}s` }}
      >
        <div
          className="flow-ring-track"
          style={{
            width: trackRadius * 2,
            height: trackRadius * 2,
            left: center,
            top: center,
          }}
        />
        {pulses.map((_, i) => (
          <div
            key={i}
            className="flow-ring-pulse"
            style={{
              offsetPath: `circle(${trackRadius}px at ${center}px ${center}px)`,
              animationDelay: `${-(duration * i) / pulses.length}s`,
            }}
          />
        ))}
        {devices.map((d) => (
          <DeviceNode key={d.label} label={d.label} x={d.x} y={d.y} />
        ))}
      </div>

      <div className="flow-ring-controls">
        <button onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</button>
        <label>
          Speed
          <input
            type="range"
            min={0.25}
            max={3}
            step={0.25}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
        <label>
          Devices
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <span className="flow-ring-count">{count}</span>
        </label>
      </div>
    </div>
  )
}
