import { useState } from 'react'
import { Icon } from './icons'

export function MetricCard({ label, value, sub, badge, badgeVariant = 'neutral' }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub   && <div className="metric-sub">{sub}</div>}
      {badge && <div className={`metric-badge badge-${badgeVariant}`}>{badge}</div>}
    </div>
  )
}

export function SentimentPill({ label }) {
  const l = label || 'neutral'
  const map = { very_positive: 'Very Positive', positive: 'Positive', neutral: 'Neutral', negative: 'Negative', very_negative: 'Very Negative' }
  return <span className={`sent-pill sent-${l}`}>{map[l] || l}</span>
}

export function RiskPill({ level }) {
  const l = level || 'low'
  return <span className={`risk-pill risk-${l}`}>{l.charAt(0).toUpperCase() + l.slice(1)}</span>
}

export function Gauge({ score, modelLabel }) {
  const s   = parseFloat(score ?? 0)
  const pct = ((s + 1) / 2) * 100
  const color = s < -0.5 ? 'var(--red)' : s < -0.2 ? 'var(--orange)' : s < 0.2 ? 'var(--yellow)' : s < 0.5 ? 'var(--teal)' : 'var(--green)'
  return (
    <div className="gauge-wrap">
      {modelLabel && <div className="gauge-model-label">{modelLabel}</div>}
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`, background: color }} />
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-muted2">-1</span>
        <span className="gauge-score" style={{ color }}>{s.toFixed(3)}</span>
        <span className="text-xs text-muted2">+1</span>
      </div>
    </div>
  )
}

export function Panel({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="panel">
      <div className="panel-trigger" onClick={() => setOpen(o => !o)}>
        <span className="panel-trigger-title"><Icon.Plus />{title}</span>
        <span className={`panel-chevron${open ? ' open' : ''}`}><Icon.ChevronDown /></span>
      </div>
      {open && <div className="panel-body">{children}</div>}
    </div>
  )
}

export function Alert({ type = 'error', children }) {
  const Ic = type === 'error' ? Icon.AlertCircle : Icon.CheckCircle
  return (
    <div className={`alert alert-${type}`}><Ic />{children}</div>
  )
}

export function Spinner({ large }) {
  return <div className="loading-center"><div className={`spinner${large ? ' spinner-lg' : ''}`} /></div>
}

export function EmptyState({ icon: IconComp, title, sub }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{IconComp ? <IconComp /> : <Icon.FileText />}</div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
    </div>
  )
}

export function TrendIndicator({ trend }) {
  if (trend === 'rising')  return <span className="trend-up">↑</span>
  if (trend === 'falling') return <span className="trend-down">↓</span>
  return <span className="trend-flat">—</span>
}
