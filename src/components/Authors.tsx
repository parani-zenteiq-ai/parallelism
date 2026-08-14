import './Authors.css'

export function Authors() {
  return (
    <section className="authors">
      <div className="authors-kicker">Written by</div>
      <div className="authors-grid">
        <div className="author-card">
          <div className="author-name">Paranidharan Muruganantham</div>
          <div className="author-role">LLM Training, ZenteiQ.ai — TPU at scale</div>
          <p className="author-bio">
            Paranidharan trains large language models at ZenteiQ.ai, working hands-on with TPU
            infrastructure at scale, and has recently been going deep on JAX and XLA. Before
            this, he was an ML researcher at the Indian Institute of Science (IISc) Bangalore,
            where he collaborated with IBM Research on the development and evaluation of the
            Granite model family.
          </p>
          <div className="author-links">
            <a href="https://github.com/baranidharan27" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/paranidharanm/" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </div>

        <div className="author-card author-card-placeholder">
          <div className="author-name">Co-author</div>
          <p className="author-bio">Bio coming soon.</p>
        </div>
      </div>
    </section>
  )
}
