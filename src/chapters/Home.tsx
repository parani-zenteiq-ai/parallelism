import { Link } from 'react-router-dom'
import { chapters } from './registry'
import { Authors } from '../components/Authors'
import './Home.css'

export function Home() {
  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-kicker">A technical guide</div>
        <h1>How LLMs Get Trained Across Thousands of GPUs</h1>
        <p className="home-lede">
          A single GPU can't hold a modern language model, let alone train one. This is a
          from-scratch walkthrough of the techniques — data, tensor, pipeline, sequence, and
          expert parallelism — that make large-scale training possible, building up one idea
          at a time.
        </p>
        <Link to={`/${chapters[0].slug}`} className="home-cta">
          Start from the beginning →
        </Link>
      </div>

      <Authors />

      <ol className="home-toc">
        {chapters.map((c) => (
          <li key={c.slug}>
            <Link to={`/${c.slug}`} className="home-toc-item">
              <span className="home-toc-order">{c.order}</span>
              <div>
                <div className="home-toc-title">{c.title}</div>
                <div className="home-toc-summary">{c.summary}</div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
