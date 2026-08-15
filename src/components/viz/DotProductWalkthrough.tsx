import { useState } from 'react'
import { Flashcard } from './Flashcard'
import './DotProductWalkthrough.css'

interface DotProductWalkthroughProps {
  vectorA: number[]
  vectorB: number[]
  onSolved?: (result: number) => void
}

export function DotProductWalkthrough({ vectorA, vectorB, onSolved }: DotProductWalkthroughProps) {
  const [solvedCount, setSolvedCount] = useState(0)
  const [sumSolved, setSumSolved] = useState(false)

  const products = vectorA.map((a, i) => a * vectorB[i])
  const total = products.reduce((s, v) => s + v, 0)
  const allProductsSolved = solvedCount >= vectorA.length

  return (
    <div className="dp-walkthrough">
      <div className="dp-row">
        {vectorA.map((a, i) => (
          <Flashcard
            key={i}
            prompt={`${a} × ${vectorB[i]} =`}
            answer={products[i]}
            onSolved={() => setSolvedCount((c) => Math.max(c, i + 1))}
          />
        ))}
      </div>

      {allProductsSolved && !sumSolved && (
        <div className="dp-sum">
          <span className="dp-sum-label">Now add them all up:</span>
          <Flashcard
            prompt={`${products.join(' + ')} =`}
            answer={total}
            onSolved={() => {
              setSumSolved(true)
              onSolved?.(total)
            }}
          />
        </div>
      )}

      {sumSolved && <div className="dp-result">That sum, {total}, is the dot product.</div>}
    </div>
  )
}
