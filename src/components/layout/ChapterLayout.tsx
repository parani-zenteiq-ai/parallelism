import { Link } from 'react-router-dom'
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { chapters, nextChapter, prevChapter } from '../../chapters/registry'
import { TableOfContents } from './TableOfContents'
import './ChapterLayout.css'

interface ChapterLayoutProps {
  slug: string
  children: ReactNode
}

export function ChapterLayout({ slug, children }: ChapterLayoutProps) {
  const meta = chapters.find((c) => c.slug === slug)
  if (!meta) {
    throw new Error(`Unknown chapter slug: ${slug}`)
  }

  const next = nextChapter(slug)
  const prev = prevChapter(slug)
  const bodyRef = useRef<HTMLDivElement>(null)

  return (
    <div className="chapter-page">
      <article className="chapter">
        <div className="chapter-kicker">Chapter {meta.order}</div>
        <h1>{meta.title}</h1>
        <div className="chapter-body" ref={bodyRef}>
          {children}
        </div>
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
      <TableOfContents containerRef={bodyRef} watchKey={slug} />
    </div>
  )
}
