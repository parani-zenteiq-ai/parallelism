import { useState } from 'react'
import { DiagramTabs } from './DiagramTabs'
import { Flashcard } from './Flashcard'
import './ReduceScatterDiagram.css'

interface ReduceScatterDiagramProps {
  vectors: number[][]
}

const COLORS = ['#e0645a', '#4f8ff0', '#3fae6a', '#c98a2e']

export function ReduceScatterDiagram({ vectors }: ReduceScatterDiagramProps) {
  const [tab, setTab] = useState(0)
  const n = vectors.length
  const sums = Array.from({ length: n }, (_, j) => vectors.reduce((s, row) => s + row[j], 0))

  return (
    <div className="rs-diagram">
      <DiagramTabs tabs={['Pieces', 'Numbers', 'Matrix']} active={tab} onChange={setTab} />
      {tab === 0 && <PiecesView n={n} />}
      {tab === 1 && <NumbersView vectors={vectors} sums={sums} />}
      {tab === 2 && <MatrixView2 vectors={vectors} sums={sums} />}
    </div>
  )
}

function PiecesView({ n }: { n: number }) {
  const [ran, setRan] = useState(false)
  return (
    <div className="rs-view">
      <div className="rs-gpus">
        {Array.from({ length: n }, (_, i) => (
          <div key={i} className="rs-gpu">
            <div className="rs-gpu-label">GPU {i}</div>
            <div className="rs-squares">
              {Array.from({ length: n }, (_, j) => (
                <div
                  key={j}
                  className="rs-square"
                  style={{
                    background: !ran || j === i ? COLORS[j] : 'var(--border)',
                    opacity: ran && j !== i ? 0.25 : 1,
                  }}
                >
                  {ran && j === i && <span className="rs-square-sigma">Σ</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="rs-run" onClick={() => setRan((r) => !r)}>
        {ran ? 'Reset' : 'Run'}
      </button>
      <p className="rs-caption">
        {ran
          ? 'Each GPU kept only its own slot, now combined (Σ) with everyone else\'s matching slot.'
          : 'Every GPU starts holding a full row of pieces, one color per slot.'}
      </p>
    </div>
  )
}

function NumbersView({ vectors, sums }: { vectors: number[][]; sums: number[] }) {
  const n = vectors.length
  const [solved, setSolved] = useState<boolean[]>(Array(n).fill(false))

  return (
    <div className="rs-view">
      <table>
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: n }, (_, j) => (
              <th key={j}>slot {j}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vectors.map((row, i) => (
            <tr key={i}>
              <td>GPU {i}</td>
              {row.map((v, j) => (
                <td key={j}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="rs-flashcards">
        {sums.map((sum, j) => (
          <Flashcard
            key={j}
            prompt={`slot ${j}: ${vectors.map((row) => row[j]).join(' + ')} =`}
            answer={sum}
            onSolved={() =>
              setSolved((prev) => {
                const next = [...prev]
                next[j] = true
                return next
              })
            }
          />
        ))}
      </div>
      {solved.every(Boolean) && (
        <p className="rs-caption">
          {sums.map((s, i) => `GPU ${i} → ${s}`).join('  •  ')}
        </p>
      )}
    </div>
  )
}

function MatrixView2({ vectors, sums }: { vectors: number[][]; sums: number[] }) {
  const n = vectors.length
  const [col, setCol] = useState<number | null>(null)

  return (
    <div className="rs-view">
      <div className="rs-matrix-cols">
        {Array.from({ length: n }, (_, j) => (
          <button
            key={j}
            className={col === j ? 'rs-col-btn active' : 'rs-col-btn'}
            onClick={() => setCol(j)}
          >
            column {j}
          </button>
        ))}
      </div>
      <div className="rs-matrix" style={{ gridTemplateColumns: `repeat(${n}, 40px)` }}>
        {vectors.map((row, i) =>
          row.map((v, j) => (
            <div key={`${i}-${j}`} className={j === col ? 'rs-mcell highlight' : 'rs-mcell'}>
              {v}
            </div>
          )),
        )}
      </div>
      {col !== null && (
        <div className="rs-equation">
          {vectors.map((row) => row[col]).join(' + ')} = <strong>{sums[col]}</strong> → GPU {col}{' '}
          holds this
        </div>
      )}
    </div>
  )
}
