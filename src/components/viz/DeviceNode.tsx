import './DeviceNode.css'

interface DeviceNodeProps {
  label: string
  x: number
  y: number
  active?: boolean
}

export function DeviceNode({ label, x, y, active }: DeviceNodeProps) {
  return (
    <div
      className={active ? 'device-node active' : 'device-node'}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {label}
    </div>
  )
}
