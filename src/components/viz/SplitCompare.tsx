import { useState } from 'react'
import { MatrixView } from './MatrixView'
import { add, multiply, sliceCols, sliceRows, type Matrix } from './matrixUtils'
import './SplitCompare.css'

interface SplitCompareProps {
  a: Matrix
  b: Matrix
}

export function SplitCompare({ a, b }: SplitCompareProps) {
  const [mode, setMode] = useState<'column' | 'row'>('column')
  const [combined, setCombined] = useState(false)

  const k = a[0].length
  const half = k / 2

  const b0 = sliceCols(b, 0, half)
  const b1 = sliceCols(b, half, k)
  const c0Column = multiply(a, b0)
  const c1Column = multiply(a, b1)
  const finalColumn = c0Column.map((row, i) => [...row, ...c1Column[i]])

  const a0 = sliceCols(a, 0, half)
  const a1 = sliceCols(a, half, k)
  const b0Row = sliceRows(b, 0, half)
  const b1Row = sliceRows(b, half, k)
  const partial0 = multiply(a0, b0Row)
  const partial1 = multiply(a1, b1Row)
  const finalRow = add(partial0, partial1)

  function switchMode(next: 'column' | 'row') {
    setMode(next)
    setCombined(false)
  }

  return (
    <div className="split-compare">
      <div className="split-toggle">
        <button
          className={mode === 'column' ? 'active' : ''}
          onClick={() => switchMode('column')}
        >
          Split B by columns
        </button>
        <button className={mode === 'row' ? 'active' : ''} onClick={() => switchMode('row')}>
          Split by inner dimension (rows of B)
        </button>
      </div>

      {mode === 'column' ? (
        <div className="split-workers">
          <div className="split-worker">
            <div className="split-worker-title">Worker 0</div>
            <MatrixView matrix={b0} label={`B columns 0..${half - 1}`} />
            <div className="split-arrow">A ×</div>
            <MatrixView matrix={c0Column} label="= complete piece of C" />
            <div className="split-badge complete">complete on its own</div>
          </div>
          <div className="split-worker">
            <div className="split-worker-title">Worker 1</div>
            <MatrixView matrix={b1} label={`B columns ${half}..${k - 1}`} />
            <div className="split-arrow">A ×</div>
            <MatrixView matrix={c1Column} label="= complete piece of C" />
            <div className="split-badge complete">complete on its own</div>
          </div>
        </div>
      ) : (
        <div className="split-workers">
          <div className="split-worker">
            <div className="split-worker-title">Worker 0</div>
            <MatrixView matrix={a0} label={`A columns 0..${half - 1}`} />
            <div className="split-arrow">×</div>
            <MatrixView matrix={b0Row} label={`B rows 0..${half - 1}`} />
            <div className="split-arrow">=</div>
            <MatrixView matrix={partial0} label="partial sum" />
            <div className="split-badge incomplete">incomplete — missing Worker 1's part</div>
          </div>
          <div className="split-worker">
            <div className="split-worker-title">Worker 1</div>
            <MatrixView matrix={a1} label={`A columns ${half}..${k - 1}`} />
            <div className="split-arrow">×</div>
            <MatrixView matrix={b1Row} label={`B rows ${half}..${k - 1}`} />
            <div className="split-arrow">=</div>
            <MatrixView matrix={partial1} label="partial sum" />
            <div className="split-badge incomplete">incomplete — missing Worker 0's part</div>
          </div>
        </div>
      )}

      {!combined ? (
        <button className="split-combine" onClick={() => setCombined(true)}>
          {mode === 'column' ? 'Place side by side' : 'Add the two partial sums together'}
        </button>
      ) : (
        <div className="split-result">
          <MatrixView
            matrix={mode === 'column' ? finalColumn : finalRow}
            label="Final result — full C = A @ B"
          />
          {mode === 'column' ? (
            <div className="split-reveal complete">
              No communication needed. Column parallelism — each worker's piece was already
              correct.
            </div>
          ) : (
            <div className="split-reveal allreduce">🎉 This is what AllReduce does.</div>
          )}
        </div>
      )}
    </div>
  )
}
