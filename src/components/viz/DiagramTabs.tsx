import './DiagramTabs.css'

interface DiagramTabsProps {
  tabs: string[]
  active: number
  onChange: (i: number) => void
}

export function DiagramTabs({ tabs, active, onChange }: DiagramTabsProps) {
  return (
    <div className="diagram-tabs">
      {tabs.map((t, i) => (
        <button
          key={t}
          className={i === active ? 'diagram-tab active' : 'diagram-tab'}
          onClick={() => onChange(i)}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
