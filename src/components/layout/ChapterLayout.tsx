import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { nextChapter, prevChapter } from '../../chapters/registry'
import './ChapterLayout.css'

interface ChapterLayoutProps {
  slug: string
  order: number
  title: string
  children: ReactNode
}

export function ChapterLayout({ slug, order, title, children }: ChapterLayoutProps) {
  const next = nextChapter(slug)
  const prev = prevChapter(slug)

  return (
    <article className="chapter">
      <div className="chapter-kicker">Chapter {order}</div>
      <h1>{title}</h1>
      <div className="chapter-body">{children}</div>
      <nav className="chapter-footer-nav">
        {prev ? (
          <Link to={`/${prev.slug}`} className="chapter-nav-link prev">
            ← {prev.title}
          </Link>
        ) : (
          <Link to="/" className="chapter-nav-link prev">
            ← Home
          </Link>
        )}
        {next && (
          <Link to={`/${next.slug}`} className="chapter-nav-link next">
            {next.title} →
          </Link>
        )}
      </nav>
    </article>
  )
}
