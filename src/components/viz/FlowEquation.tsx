import './FlowEquation.css'

interface FlowEquationProps {
  parts: string[]
  result: string
}

export function FlowEquation({ parts, result }: FlowEquationProps) {
  return (
    <div className="flow-equation">
      {parts.map((p, i) => (
        <div key={i} className="flow-equation-item">
          <div className="flow-equation-box">{p}</div>
          {i < parts.length - 1 && <div className="flow-equation-plus">+</div>}
        </div>
      ))}
      <div className="flow-equation-eq">=</div>
      <div className="flow-equation-box result">{result}</div>
    </div>
  )
}
