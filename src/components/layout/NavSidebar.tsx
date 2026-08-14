import { NavLink } from 'react-router-dom'
import { chapters } from '../../chapters/registry'
import './NavSidebar.css'

export function NavSidebar() {
  return (
    <nav className="nav-sidebar">
      <NavLink to="/" end className="nav-home">
        Parallelism
      </NavLink>
      <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-about active' : 'nav-about')}>
        About the Authors
      </NavLink>
      <ol className="nav-chapters">
        {chapters.map((c) => (
          <li key={c.slug}>
            <NavLink
              to={`/${c.slug}`}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <span className="nav-order">{c.order}</span>
              <span>{c.title}</span>
            </NavLink>
          </li>
        ))}
      </ol>
    </nav>
  )
}
