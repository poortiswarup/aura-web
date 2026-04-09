import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { MetricCard, SentimentPill, Gauge, Spinner, EmptyState, TrendIndicator } from '../components/ui'
import { Icon } from '../components/icons'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 500 }}>
        {payload[0]?.value?.toFixed(4)}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [articles,  setArticles]  = useState([])
  const [companies, setCompanies] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/articles'),
      axios.get('/api/companies'),
      axios.get('/api/snapshots'),
    ]).then(([a, c, s]) => {
      setArticles(a.data)
      setCompanies(c.data)
      setSnapshots(s.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner large />

  const avgSent  = articles.length
    ? articles.reduce((s, a) => s + (a.aggregate_score || 0), 0) / articles.length
    : 0
  const critical = companies.filter(c => ['critical', 'high'].includes(c.risk_level)).length

  const chartData = [...snapshots]
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(-30)
    .map(s => ({ date: (s.date || '').slice(5), sentiment: +(s.avg_sentiment || 0).toFixed(4) }))

  const recent = articles.slice(0, 5)

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-subtitle">Affective Uncertainty &amp; Risk Analytics — overview</div>
      </div>

      {/* Stat cards */}
      <div className="metric-grid">
        <MetricCard
          label="Articles Analyzed"
          value={articles.length}
          sub="Total processed"
        />
        <MetricCard
          label="Companies Tracked"
          value={companies.length}
          sub="Active monitoring"
        />
        <MetricCard
          label="Avg. Sentiment"
          value={avgSent.toFixed(4)}
          sub="Aggregate score"
          badge={avgSent >= 0.15 ? 'Positive' : avgSent <= -0.15 ? 'Negative' : 'Neutral'}
          badgeVariant={avgSent >= 0.15 ? 'positive' : avgSent <= -0.15 ? 'negative' : 'neutral'}
        />
        <MetricCard
          label="Risk Alerts"
          value={critical}
          sub="High / Critical"
          badge={critical > 0 ? 'Action required' : 'All clear'}
          badgeVariant={critical > 0 ? 'warning' : 'positive'}
        />
      </div>

      {/* Sentiment trend */}
      <div className="chart-card">
        <div className="chart-title">Sentiment Trend — Last 30 Snapshots</div>
        {chartData.length < 2
          ? <EmptyState icon={Icon.Market} title="No trend data" sub="Add market snapshots on the Market page to populate this chart" />
          : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="var(--surface3)" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--bg)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )
        }
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Recent articles */}
        <div>
          <div className="section-label">Recent Articles</div>
          {recent.length === 0
            ? <EmptyState icon={Icon.FileText} title="No articles yet" sub="Go to News Feed to analyze your first headline" />
            : recent.map(a => (
              <div key={a.id} className="article-row">
                <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                  {a.company && <span className="article-ticker">{a.company}</span>}
                  {a.source  && <span className="article-meta">· {a.source}</span>}
                  <span style={{ marginLeft: 'auto' }}><SentimentPill label={a.sentiment_label} /></span>
                </div>
                <div className="article-headline">{a.headline}</div>
                <Gauge score={a.aggregate_score} />
              </div>
            ))
          }
        </div>

        {/* Tracked companies */}
        <div>
          <div className="section-label">Tracked Companies</div>
          {companies.length === 0
            ? <EmptyState icon={Icon.Companies} title="No companies tracked" sub="Go to Companies to start monitoring" />
            : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Sentiment</th>
                      <th>Trend</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.slice(0, 8).map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{c.ticker}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.name}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 12.5 }}>
                          {c.latest_sentiment != null ? c.latest_sentiment.toFixed(4) : '—'}
                        </td>
                        <td><TrendIndicator trend={c.sentiment_trend} /></td>
                        <td>
                          <span className={`risk-pill risk-${c.risk_level || 'low'}`}>
                            {(c.risk_level || 'low').charAt(0).toUpperCase() + (c.risk_level || 'low').slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>
    </>
  )
}
