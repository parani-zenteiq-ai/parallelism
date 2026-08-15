import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import './TableOfContents.css'

interface Heading {
  id: string
  text: string
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function TableOfContents({
  containerRef,
  watchKey,
}: {
  containerRef: RefObject<HTMLElement | null>
  watchKey: string
}) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = Array.from(container.querySelectorAll('h2'))
    const items: Heading[] = elements.map((el, i) => {
      if (!el.id) el.id = slugify(el.textContent || `section-${i}`)
      return { id: el.id, text: el.textContent || '' }
    })
    setHeadings(items)
    setActiveId(items[0]?.id ?? null)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-15% 0px -70% 0px' },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchKey])

  if (headings.length === 0) return null

  return (
    <nav className="toc">
      <div className="toc-label">On this page</div>
      <ul>
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className={h.id === activeId ? 'toc-link active' : 'toc-link'}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
