import { Flashcard } from './Flashcard'
import { PredictReveal } from './PredictReveal'
import './ShapeExercise.css'

interface ShapeExerciseProps {
  a: [number, number]
  b: [number, number]
}

export function ShapeExercise({ a, b }: ShapeExerciseProps) {
  const [aRows, aCols] = a
  const [bRows, bCols] = b
  const valid = aCols === bRows

  return (
    <div className="shape-exercise">
      <div className="shape-exercise-shapes">
        A: ({aRows}, {aCols}) &nbsp;&nbsp; B: ({bRows}, {bCols})
      </div>

      {valid ? (
        <div className="shape-exercise-cards">
          <Flashcard prompt="m (rows of A, rows of C) =" answer={aRows} />
          <Flashcard prompt="k (columns of A, rows of B) =" answer={aCols} />
          <Flashcard prompt="n (columns of B, columns of C) =" answer={bCols} />
        </div>
      ) : (
        <PredictReveal
          prompt="Can A and B even be multiplied?"
          options={[
            { label: 'Yes, valid', correct: false },
            { label: 'No, invalid', correct: true },
          ]}
          explanation={
            <>
              A's columns ({aCols}) don't match B's rows ({bRows}) — the inner dimensions have to
              be equal, full stop. This multiplication is undefined, not just "less accurate."
            </>
          }
        />
      )}
    </div>
  )
}
