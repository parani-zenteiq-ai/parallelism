import type { Matrix } from './matrixUtils'
import './MatrixView.css'

interface MatrixViewProps {
  matrix: Matrix
  label?: string
  compareTo?: Matrix
}

export function MatrixView({ matrix, label, compareTo }: MatrixViewProps) {
  const cols = matrix[0]?.length ?? 0
  return (
    <div className="matrix-view">
      {label && <div className="matrix-view-label">{label}</div>}
      <div className="matrix-view-grid" style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}>
        {matrix.map((row, i) =>
          row.map((v, j) => {
            const cls = compareTo
              ? v === compareTo[i][j]
                ? 'matrix-view-cell match'
                : 'matrix-view-cell mismatch'
              : 'matrix-view-cell'
            return (
              <div key={`${i}-${j}`} className={cls}>
                {v}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
