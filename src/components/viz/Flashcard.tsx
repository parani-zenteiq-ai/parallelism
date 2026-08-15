import { useState } from 'react'
import type { ReactNode } from 'react'
import './Flashcard.css'

interface FlashcardProps {
  prompt: ReactNode
  answer: number
  onSolved?: () => void
}

export function Flashcard({ prompt, answer, onSolved }: FlashcardProps) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect' | 'revealed'>('idle')

  function check() {
    if (Number(value) === answer) {
      setStatus('correct')
      onSolved?.()
    } else {
      setStatus('incorrect')
    }
  }

  function reveal() {
    setStatus('revealed')
    onSolved?.()
  }

  const solved = status === 'correct' || status === 'revealed'

  return (
    <div className={`flashcard flashcard-${status}`}>
      <div className="flashcard-prompt">{prompt}</div>
      {solved ? (
        <div className="flashcard-answer">
          {status === 'revealed' ? `= ${answer}` : `✓ ${answer}`}
        </div>
      ) : (
        <div className="flashcard-input-row">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (status === 'incorrect') setStatus('idle')
            }}
            onKeyDown={(e) => e.key === 'Enter' && check()}
            placeholder="?"
          />
          <button onClick={check}>Check</button>
          <button className="flashcard-reveal" onClick={reveal}>
            Show answer
          </button>
        </div>
      )}
      {status === 'incorrect' && <div className="flashcard-feedback">Not quite — try again.</div>}
    </div>
  )
}
