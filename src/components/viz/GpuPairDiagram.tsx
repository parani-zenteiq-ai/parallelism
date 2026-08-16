import { useState } from 'react'
import './GpuPairDiagram.css'

type Mode = 'column' | 'row'

export function GpuPairDiagram() {
  const [mode, setMode] = useState<Mode>('column')

  return (
    <div className="gpu-pair">
      <div className="gpu-pair-toggle">
        <button className={mode === 'column' ? 'active' : ''} onClick={() => setMode('column')}>
          Column split
        </button>
        <button className={mode === 'row' ? 'active' : ''} onClick={() => setMode('row')}>
          Row split
        </button>
      </div>

      <div className="gpu-pair-diagram">
        <div className="gpu-chip">
          <div className="gpu-chip-label">GPU 0</div>
          <div className="gpu-core-grid">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="gpu-core-cell" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </div>

        <div className="gpu-pair-links">
          <div className="gpu-link left">
            <div className="gpu-pulse" />
          </div>
          <div className={mode === 'row' ? 'gpu-combine row' : 'gpu-combine'}>
            {mode === 'column' ? '⧉' : '+'}
          </div>
          <div className="gpu-link right">
            <div className="gpu-pulse" />
          </div>
        </div>

        <div className="gpu-chip">
          <div className="gpu-chip-label">GPU 1</div>
          <div className="gpu-core-grid">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="gpu-core-cell"
                style={{ animationDelay: `${0.5 + i * 0.12}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="gpu-pair-caption">
        {mode === 'column'
          ? 'Both GPUs are crunching their own matmul the whole time. Their results still travel across to meet — that middle icon just means "stitch together," no extra math.'
          : 'Same picture, same data movement — but this time the middle icon is a real addition. That combine step, happening between two GPUs, is AllReduce.'}
      </div>
    </div>
  )
}
