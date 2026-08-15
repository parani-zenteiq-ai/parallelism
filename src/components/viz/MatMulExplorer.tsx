import { useState } from 'react'
import { DotProductWalkthrough } from './DotProductWalkthrough'
import { column, type Matrix } from './matrixUtils'
import './MatMulExplorer.css'

interface MatMulExplorerProps {
  a: Matrix
  b: Matrix
}

export function MatMulExplorer({ a, b }: MatMulExplorerProps) {
  const [selected, setSelected] = useState<{ i: number; j: number } | null>(null)
  const [solved, setSolved] = useState<Record<string, number>>({})

  const m = a.length
  const k = a[0].length
  const n = b[0].length

  function key(i: number, j: number) {
    return `${i}-${j}`
  }

  return (
    <div className="matmul-explorer">
      <div
        className="matmul-grid-outer"
        style={{ gridTemplateColumns: `${k * 48}px 1fr`, gridTemplateRows: `${k * 48}px 1fr` }}
      >
        <div className="matmul-corner" />

        <div className="matmul-sub b-sub" style={{ gridTemplateColumns: `repeat(${n}, 48px)` }}>
          {b.map((row, i) =>
            row.map((v, j) => (
              <div
                key={key(i, j)}
                className={selected && selected.j === j ? 'matmul-cell highlight' : 'matmul-cell'}
              >
                {v}
              </div>
            )),
          )}
        </div>

        <div className="matmul-sub a-sub" style={{ gridTemplateColumns: `repeat(${k}, 48px)` }}>
          {a.map((row, i) =>
            row.map((v, j) => (
              <div
                key={key(i, j)}
                className={selected && selected.i === i ? 'matmul-cell highlight' : 'matmul-cell'}
              >
                {v}
              </div>
            )),
          )}
        </div>

        <div className="matmul-sub c-sub" style={{ gridTemplateColumns: `repeat(${n}, 48px)` }}>
          {Array.from({ length: m }, (_, i) =>
            Array.from({ length: n }, (_, j) => {
              const isSelected = selected && selected.i === i && selected.j === j
              const value = solved[key(i, j)]
              return (
                <button
                  key={key(i, j)}
                  className={
                    isSelected
                      ? 'matmul-cell matmul-c-cell selected'
                      : value !== undefined
                        ? 'matmul-cell matmul-c-cell filled'
                        : 'matmul-cell matmul-c-cell'
                  }
                  onClick={() => setSelected({ i, j })}
                >
                  {value ?? '?'}
                </button>
              )
            }),
          )}
        </div>
      </div>

      {selected && (
        <div className="matmul-detail">
          <div className="matmul-detail-label">
            C[{selected.i}][{selected.j}] = row {selected.i} of A · column {selected.j} of B
          </div>
          {solved[key(selected.i, selected.j)] !== undefined ? (
            <div className="matmul-detail-solved">
              Already solved — C[{selected.i}][{selected.j}] = {solved[key(selected.i, selected.j)]}
            </div>
          ) : (
            <DotProductWalkthrough
              key={key(selected.i, selected.j)}
              vectorA={a[selected.i]}
              vectorB={column(b, selected.j)}
              onSolved={(result) =>
                setSolved((prev) => ({ ...prev, [key(selected.i, selected.j)]: result }))
              }
            />
          )}
        </div>
      )}
    </div>
  )
}
