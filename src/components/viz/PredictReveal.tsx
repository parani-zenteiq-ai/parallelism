import { useState } from 'react'
import type { ReactNode } from 'react'
import './PredictReveal.css'

interface Option {
  label: string
  correct: boolean
}

interface PredictRevealProps {
  prompt: ReactNode
  options: Option[]
  explanation: ReactNode
}

export function PredictReveal({ prompt, options, explanation }: PredictRevealProps) {
  const [chosen, setChosen] = useState<number | null>(null)

  return (
    <div className="predict-reveal">
      <div className="predict-prompt">{prompt}</div>
      <div className="predict-options">
        {options.map((opt, i) => {
          const isChosen = chosen === i
          const cls = isChosen ? (opt.correct ? 'predict-opt correct' : 'predict-opt wrong') : 'predict-opt'
          return (
            <button key={i} className={cls} onClick={() => setChosen(i)} disabled={chosen !== null}>
              {isChosen && (opt.correct ? '✓ ' : '✗ ')}
              {opt.label}
            </button>
          )
        })}
      </div>
      {chosen !== null && (
        <div className="predict-explanation">
          {!options[chosen].correct && <div className="predict-correction">Not quite —</div>}
          {explanation}
        </div>
      )}
    </div>
  )
}
