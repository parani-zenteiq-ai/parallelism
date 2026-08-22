import { useState } from 'react'
import { DiagramTabs } from './DiagramTabs'
import { CollectiveDiagram } from './CollectiveDiagram'
import { RingAllReduce } from './RingAllReduce'
import './AllGatherDiagram.css'

const COLORS = ['#e0645a', '#4f8ff0', '#3fae6a', '#c98a2e']
const NUMBERS = [11, 22, 33, 44]
const ROWS = [
  [1, 2],
  [3, 4],
  [5, 6],
  [7, 8],
]

interface AllGatherDiagramProps {
  ringVectors?: number[][]
}

export function AllGatherDiagram({ ringVectors }: AllGatherDiagramProps) {
  const [tab, setTab] = useState(0)
  return (
    <div className="ag-diagram">
      <DiagramTabs tabs={['Pieces', 'Numbers', 'Matrix', 'Signals', 'Ring']} active={tab} onChange={setTab} />
      {tab === 0 && <PiecesTab />}
      {tab === 1 && <NumbersTab />}
      {tab === 2 && <MatrixTab />}
      {tab === 3 && (
        <div className="ag-view">
          <CollectiveDiagram mode="allgather" />
        </div>
      )}
      {tab === 4 && ringVectors && (
        <div className="ag-view">
          <RingAllReduce vectors={ringVectors} />
          <p className="ag-caption">
            The last 3 steps here (all-gather phase) are exactly this operation, GPU by GPU —
            picking up where reduce-scatter left off.
          </p>
        </div>
      )}
    </div>
  )
}

function PiecesTab() {
  const [ran, setRan] = useState(false)
  return (
    <div className="ag-view">
      <div className="ag-gpus">
        {COLORS.map((_, i) => (
          <div key={i} className="ag-gpu">
            <div className="ag-gpu-label">GPU {i}</div>
            <div className="ag-squares">
              {COLORS.map((c, j) => (
                <div
                  key={j}
                  className="ag-square"
                  style={{ background: ran || i === j ? c : 'var(--border)' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="ag-run" onClick={() => setRan((r) => !r)}>
        {ran ? 'Reset' : 'Run'}
      </button>
      <p className="ag-caption">
        {ran
          ? 'Every GPU now holds all four pieces — no arithmetic happened, just collection.'
          : 'Each GPU starts with only its own, different piece.'}
      </p>
    </div>
  )
}

function NumbersTab() {
  const [ran, setRan] = useState(false)
  return (
    <div className="ag-view">
      <div className="ag-gpus">
        {NUMBERS.map((n, i) => (
          <div key={i} className="ag-gpu">
            <div className="ag-gpu-label">GPU {i}</div>
            <div className="ag-number-box">{ran ? `[${NUMBERS.join(', ')}]` : n}</div>
          </div>
        ))}
      </div>
      <button className="ag-run" onClick={() => setRan((r) => !r)}>
        {ran ? 'Reset' : 'Run'}
      </button>
    </div>
  )
}

function MatrixTab() {
  const [ran, setRan] = useState(false)
  return (
    <div className="ag-view">
      <div className="ag-gpus">
        {ROWS.map((_, i) => (
          <div key={i} className="ag-gpu">
            <div className="ag-gpu-label">GPU {i}</div>
            <div className="ag-matrix">
              {ROWS.map((r, ri) => {
                const known = ran || ri === i
                return (
                  <div key={ri} className="ag-matrix-row">
                    {r.map((v, ci) => (
                      <div key={ci} className={ri === i ? 'ag-mcell own' : 'ag-mcell'}>
                        {known ? v : '–'}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <button className="ag-run" onClick={() => setRan((r) => !r)}>
        {ran ? 'Reset' : 'Run'}
      </button>
      <p className="ag-caption">
        {ran
          ? 'Each GPU contributed one row — now every GPU holds the full matrix, all four rows.'
          : 'Each GPU starts holding just its own row (highlighted); the rest are unknown.'}
      </p>
    </div>
  )
}
