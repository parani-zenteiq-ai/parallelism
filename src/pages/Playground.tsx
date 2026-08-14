import { FlowRing } from '../components/viz/FlowRing'
import './Playground.css'

export function Playground() {
  return (
    <div className="playground">
      <div className="playground-kicker">Component playground</div>
      <h1>Interactive Diagram Primitives</h1>
      <p className="playground-note">
        Prototype building blocks for chapter diagrams — generic device nodes and a looping
        data-flow ring, not tied to any specific chapter's explanation yet. Play with speed and
        device count below.
      </p>

      <div className="playground-demo">
        <FlowRing />
      </div>
    </div>
  )
}
