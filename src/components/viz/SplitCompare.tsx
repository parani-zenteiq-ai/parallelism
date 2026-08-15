import { useState } from 'react'
import { MatrixView } from './MatrixView'
import { add, multiply, sliceCols, sliceRows, type Matrix } from './matrixUtils'
import './SplitCompare.css'

interface SplitCompareProps {
  a: Matrix
  b: Matrix
}

type Mode = 'column' | 'row'
type Step = 'workers' | 'tried' | 'combined'

export function SplitCompare({ a, b }: SplitCompareProps) {
  const [mode, setMode] = useState<Mode>('column')
  const [step, setStep] = useState<Step>('workers')

  const k = a[0].length
  const half = k / 2

  const c = multiply(a, b)

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

  function switchMode(next: Mode) {
    setMode(next)
    setStep('workers')
  }

  return (
    <div className="split-compare">
      <div className="split-toggle">
        <button className={mode === 'column' ? 'active' : ''} onClick={() => switchMode('column')}>
          Split B by columns
        </button>
        <button className={mode === 'row' ? 'active' : ''} onClick={() => switchMode('row')}>
          Split B by rows
        </button>
      </div>

      {mode === 'column' ? (
        <>
          <div className="split-workers">
            <div className="split-worker">
              <div className="split-worker-title">Worker 0</div>
              <MatrixView matrix={b0} label={`B, columns 0-${half - 1}`} />
              <div className="split-arrow">A ×</div>
              <MatrixView matrix={c0Column} label="= Worker 0's result" />
            </div>
            <div className="split-worker">
              <div className="split-worker-title">Worker 1</div>
              <MatrixView matrix={b1} label={`B, columns ${half}-${k - 1}`} />
              <div className="split-arrow">A ×</div>
              <MatrixView matrix={c1Column} label="= Worker 1's result" />
            </div>
          </div>

          {step !== 'combined' ? (
            <button className="split-combine" onClick={() => setStep('combined')}>
              Place both results side by side
            </button>
          ) : (
            <div className="split-result">
              <MatrixView matrix={finalColumn} compareTo={c} label="Placed side by side" />
              <div className="split-reveal complete">
                ✅ That's already the full, correct C — no talking between workers required.
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="split-note">
            To split B by rows, each worker also has to take the matching columns of A — you
            can't multiply a 4×4 by a 2×4 otherwise (try the shapes yourself: 4 columns must line
            up with 2 rows — it doesn't).
          </p>
          <div className="split-workers">
            <div className="split-worker">
              <div className="split-worker-title">Worker 0</div>
              <MatrixView matrix={a0} label={`A, columns 0-${half - 1}`} />
              <div className="split-arrow">×</div>
              <MatrixView matrix={b0Row} label={`B, rows 0-${half - 1}`} />
              <div className="split-arrow">=</div>
              <MatrixView matrix={partial0} label="Worker 0's result" />
            </div>
            <div className="split-worker">
              <div className="split-worker-title">Worker 1</div>
              <MatrixView matrix={a1} label={`A, columns ${half}-${k - 1}`} />
              <div className="split-arrow">×</div>
              <MatrixView matrix={b1Row} label={`B, rows ${half}-${k - 1}`} />
              <div className="split-arrow">=</div>
              <MatrixView matrix={partial1} label="Worker 1's result" />
            </div>
          </div>

          {step === 'workers' && (
            <button className="split-combine" onClick={() => setStep('tried')}>
              Place both results side by side, same as before
            </button>
          )}

          {step === 'tried' && (
            <div className="split-result">
              <div className="split-attempt-row">
                <MatrixView matrix={partial0} compareTo={c} label="Worker 0's result vs. real C" />
                <MatrixView matrix={partial1} compareTo={c} label="Worker 1's result vs. real C" />
              </div>
              <div className="split-reveal wrong">
                ❌ Red cells don't match. Neither worker's result is correct on its own this time.
              </div>
              <button className="split-combine" onClick={() => setStep('combined')}>
                Hmm — what if we add them together instead?
              </button>
            </div>
          )}

          {step === 'combined' && (
            <div className="split-result">
              <MatrixView matrix={finalRow} compareTo={c} label="Worker 0's result + Worker 1's result" />
              <div className="split-reveal allreduce">
                🎉 All green — adding the two workers' results gives the real C. That "talk to
                each other and add" step is exactly what AllReduce does.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
