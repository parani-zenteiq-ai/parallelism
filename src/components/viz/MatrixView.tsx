import type { Matrix } from './matrixUtils'
import './MatrixView.css'

interface MatrixViewProps {
  matrix: Matrix
  label?: string
}

export function MatrixView({ matrix, label }: MatrixViewProps) {
  const cols = matrix[0]?.length ?? 0
  return (
    <div className="matrix-view">
      {label && <div className="matrix-view-label">{label}</div>}
      <div className="matrix-view-grid" style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}>
        {matrix.map((row, i) =>
          row.map((v, j) => (
            <div key={`${i}-${j}`} className="matrix-view-cell">
              {v}
            </div>
          )),
        )}
      </div>
    </div>
  )
}
