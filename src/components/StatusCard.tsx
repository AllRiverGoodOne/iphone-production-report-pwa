interface StatusCardProps {
  label: string
  value: string
  tone?: 'neutral' | 'good' | 'warn'
}

export function StatusCard({ label, value, tone = 'neutral' }: StatusCardProps) {
  return (
    <div className={`status-card status-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
