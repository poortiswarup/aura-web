import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts'
import { MetricCard, SentimentPill, Spinner, EmptyState } from '../components/ui'
import { Icon } from '../components/icons'

const LABELS    = ['very_negative', 'negative', 'neutral', 'positive', 'very_positive']
const LABEL_MAP = { very_negative: 'Very Negative', negative: 'Negative', neutral: 'Neutral', positive: 'Positive', very_positive: 'Very Positive' }
const COLORS    = { very_negative: '#ef4444', negative: '#f97316', neutral: '#64748b', positive: '#14b8a6', very_positive: '#22c55e' }

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <span style={{ color: 'var(--text)' }}>{payload[0].name}: </span>
      <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{payload[0].value}</span>
    </div>
  )
}

export default function Sentiment() {
  const [articles,  setArticles]  = useState([])
  const [companies, setCompanies] = useState([])
  const [filter,    setFilter]    = useState('All')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([axios.get('/api/articles'), axios.get('/api/companies')])
      .then(([a, c]) => { setArticles(a.data); setCompanies(c.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner large />

  const companyOptions = ['All', ...new Set(articles.map(a => a.company).filter(Boolean))]
  const filtered = filter === 'All' ? articles : articles.filter(a => a.company === filter)

  const dist = LABELS.map(l => ({ name: LABEL_MAP[l], value: filtered.filter(a => a.sentiment_label === l).length, color: COLORS[l] })).filter(d => d.value > 0)

  const avg = key => filtered.length ? filtered.reduce((s, a) => s + (a[key] || 0), 0) / filtered.length : 0

  const modelAvgs = [
    { model: 'VADER',     score: avg('vader_score') },
    { model: 'TextBlob',  score: avg('textblob_score') },
    { model: 'L-M',       score: avg('lm_score') },
    { model: 'FinBERT',   score: avg('finbert_score') },
  ]

  const radarData = modelAvgs.map(m => ({ subject: m.model, score: Math.abs(m.score) }))
  const overallAvg = avg('aggregate_score')

  return (
    <>
      <div className="page-header">
        <div className="page-title">Sentiment Analysis</div>
        <div className="page-subtitle">Multi-model NLP breakdown across your article library</div>
      </div>

      {/* Company filter */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Filter by Company</label>
        <select className="input select" style={{ maxWidth: 240 }} value={filter} onChange={e => setFilter(e.target.value)}>
          {companyOptions.map(o => <option key={o}>{o}</option>)}
        </select>
        <span className="text-sm text-muted2">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={Icon.BarChart} title="No articles to analyze" sub="Add articles on the News Feed page first" />
        : (
          <>
            {/* Summary metrics */}
            <div className="metric-grid" style={{ marginBottom: 20 }}>
              {modelAvgs.map(m => (
                <MetricCard
                  key={m.model}
                  label={m.model}
                  value={m.score.toFixed(4)}
                  sub="Average score"
                  badge={m.score >= 0.1 ? 'Positive' : m.score <= -0.1 ? 'Negative' : 'Neutral'}
                  badgeVariant={m.score >= 0.1 ? 'positive' : m.score <= -0.1 ? 'negative' : 'neutral'}
                />
              ))}
            </div>

            {/* Charts row */}
            <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
              {/* Pie */}
              <div className="chart-card" style={{ marginBottom: 0 }}>
                <div className="chart-title">Sentiment Distribution</div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={dist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={2}>
                      {dist.map((d, i) => <Cell key={i} fill={d.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-3" style={{ flexWrap: 'wrap', marginTop: 8 }}>
                  {dist.map(d => (
                    <span key={d.name} className="text-xs flex items-center gap-1">
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
                      <span className="text-muted2">{d.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Radar */}
              <div className="chart-card" style={{ marginBottom: 0 }}>
                <div className="chart-title">Model Agreement Radar</div>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                    <Radar dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.12} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart */}
            <div className="chart-card">
              <div className="chart-title">Average Score by Model</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={modelAvgs} margin={{ top: 5, right: 16, bottom: 5, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="model" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[-1, 1]} tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: 'var(--text3)' }}
                    formatter={v => [v.toFixed(4), 'Score']}
                  />
                  <ReferenceLine y={0} stroke="var(--surface3)" strokeDasharray="4 4" />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}
                    fill="var(--accent)"
                    label={{ position: 'top', fontSize: 10, fill: 'var(--text3)', formatter: v => v.toFixed(3) }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )
      }
    </>
  )
}
