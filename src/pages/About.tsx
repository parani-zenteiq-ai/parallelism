import './About.css'

export function About() {
  return (
    <div className="about">
      <h1>About the Authors</h1>
      <p className="about-intro">
        This site is written and maintained by two authors.
      </p>

      <div className="author-card">
        <div className="author-name">Paranidharan Muruganantham</div>
        <div className="author-role">ZenteiQ.ai — building LLMs on TPU/GCP</div>
        <p className="author-bio">
          Paranidharan works on machine learning and AI, focused on GenAI, foundational LLM/VLM
          development, data pipelines, and MLOps. He is a Project Associate at the AiREX Lab,
          Indian Institute of Science (IISc) Bangalore, a contributor to SciREX (an open-source
          scientific machine learning library), and Startup Coordinator for CASML at IISc.
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
  )
}
