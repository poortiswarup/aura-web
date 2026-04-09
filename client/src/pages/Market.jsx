import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, ReferenceLine,
} from 'recharts'
import { MetricCard, Panel, Alert, Spinner, EmptyState } from '../components/ui'
import { Icon } from '../components/icons'

export default function Market() {
  const [snapshots,  setSnapshots]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('All')
  const [form,       setForm]       = useState({ company: '', date: '', avg_sentiment: '', stock_price: '', price_change_pct: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  const load = () => axios.get('/api/snapshots').then(r => setSnapshots(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.company.trim() || !form.date) { setError('Company and date are required.'); return }
    setError(''); setSuccess(''); setSubmitting(true)
    try {
      await axios.post('/api/snapshots', {
        ...form,
        company: form.company.toUpperCase(),
        avg_sentiment:    parseFloat(form.avg_sentiment)   || 0,
        stock_price:      parseFloat(form.stock_price)     || 0,
        price_change_pct: parseFloat(form.price_change_pct) || 0,
      })
      setSuccess('Snapshot saved.')
      setForm({ company: '', date: '', avg_sentiment: '', stock_price: '', price_change_pct: '' })
      load()
    } catch { setError('Failed to save snapshot.') }
    finally { setSubmitting(false) }
  }

  const del = async id => {
    await axios.delete(`/api/snapshots/${id}`)
    setSnapshots(s => s.filter(x => x.id !== id))
  }

  if (loading) return <Spinner large />

  const companies = ['All', ...new Set(snapshots.map(s => s.company).filter(Boolean))]
  const base = filter === 'All' ? snapshots : snapshots.filter(s => s.company === filter)
  const sorted = [...base].sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  // Pearson correlation
  let correlation = null
  const pairs = sorted.filter(s => s.avg_sentiment != null && s.price_change_pct != null)
  if (pairs.length >= 3) {
    const xs = pairs.map(p => p.avg_sentiment)
    const ys = pairs.map(p => p.price_change_pct)
    const meanX = xs.reduce((a, b) => a + b) / xs.length
    const meanY = ys.reduce((a, b) => a + b) / ys.length
    const num = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0)
    const den = Math.sqrt(xs.reduce((s, x) => s + (x - meanX) ** 2, 0) * ys.reduce((s, y) => s + (y - meanY) ** 2, 0))
    correlation = den ? num / den : null
  }

  const strength = correlation === null ? '—'
    : Math.abs(correlation) > 0.7 ? 'Strong'
    : Math.abs(correlation) > 0.4 ? 'Moderate' : 'Weak'

  const lineData = sorted.map(s => ({
    date:           s.date?.slice(5),
    sentiment:      +(s.avg_sentiment || 0).toFixed(4),
    price:          +(s.stock_price   || 0).toFixed(2),
  }))

  const scatterData = pairs.map(p => ({
    x: +(p.avg_sentiment || 0).toFixed(4),
    y: +(p.price_change_pct || 0).toFixed(4),
  }))

  return (
    <>
      <div className="page-header">
        <div className="page-title">Market Correlation</div>
        <div className="page-subtitle">Sentiment vs. market movement — correlation analysis</div>
      </div>

      {/* Add snapshot form */}
      <Panel title="Add Market Snapshot" defaultOpen={snapshots.length === 0}>
        {error   && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
        <div className="grid-3" style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Ticker <span>*</span></label>
            <input className="input" placeholder="e.g. TSLA" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date <span>*</span></label>
            <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Avg. Sentiment (-1 to 1)</label>
            <input className="input" type="number" step="0.001" min="-1" max="1" placeholder="0.000" value={form.avg_sentiment} onChange={e => setForm(f => ({ ...f, avg_sentiment: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Stock Price ($)</label>
            <input className="input" type="number" step="0.01" placeholder="0.00" value={form.stock_price} onChange={e => setForm(f => ({ ...f, stock_price: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Price Change (%)</label>
            <input className="input" type="number" step="0.01" placeholder="0.00" value={form.price_change_pct} onChange={e => setForm(f => ({ ...f, price_change_pct: e.target.value }))} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={submitting}>
          <Icon.Plus />
          {submitting ? 'Saving…' : 'Save Snapshot'}
        </button>
      </Panel>

      {/* Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Company</label>
        <select className="input select" style={{ maxWidth: 200 }} value={filter} onChange={e => setFilter(e.target.value)}>
          {companies.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="text-sm text-muted2">{base.length} snapshot{base.length !== 1 ? 's' : ''}</span>
      </div>

      {sorted.length === 0
        ? <EmptyState icon={Icon.Market} title="No snapshot data" sub="Use the form above to add sentiment and price data points" />
        : (
          <>
            {/* Correlation metrics */}
            {correlation !== null && (
              <div className="metric-grid" style={{ marginBottom: 20 }}>
                <MetricCard
                  label="Pearson Correlation"
                  value={correlation.toFixed(4)}
                  sub="Sentiment ↔ Price Change"
                  badge={correlation > 0 ? 'Positive' : 'Negative'}
                  badgeVariant={correlation > 0 ? 'positive' : 'negative'}
                />
                <MetricCard
                  label="Data Points"
                  value={pairs.length}
                  sub="Valid observation pairs"
                />
                <MetricCard
                  label="Signal Strength"
                  value={strength}
                  sub={`|r| = ${Math.abs(correlation).toFixed(4)}`}
                  badge={Math.abs(correlation) > 0.5 ? 'Significant' : 'Weak'}
                  badgeVariant={Math.abs(correlation) > 0.5 ? 'positive' : 'neutral'}
                />
                <MetricCard
                  label="Snapshots Total"
                  value={base.length}
                  sub="All date entries"
                />
              </div>
            )}

            {/* Dual-axis line chart */}
            {lineData.length >= 2 && (
              <div className="chart-card">
                <div className="chart-title">Sentiment vs. Stock Price Over Time</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={lineData} margin={{ top: 5, right: 24, bottom: 5, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" domain={[-1, 1]} tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: 'var(--text3)' }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text3)' }} />
                    <ReferenceLine yAxisId="left" y={0} stroke="var(--surface3)" strokeDasharray="4 4" />
                    <Line yAxisId="left"  type="monotone" dataKey="sentiment" stroke="var(--accent)"  strokeWidth={2} dot={false} name="Sentiment" />
                    <Line yAxisId="right" type="monotone" dataKey="price"     stroke="var(--purple)"  strokeWidth={2} dot={false} name="Price ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Scatter plot */}
            {scatterData.length >= 3 && (
              <div className="chart-card">
                <div className="chart-title">Sentiment vs. Price Change — Scatter</div>
                <ResponsiveContainer width="100%" height={260}>
                  <ScatterChart margin={{ top: 5, right: 24, bottom: 5, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis type="number" dataKey="x" name="Sentiment"   tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} domain={[-1, 1]} label={{ value: 'Sentiment', position: 'insideBottom', offset: -2, fill: 'var(--text3)', fontSize: 10 }} />
                    <YAxis type="number" dataKey="y" name="Price Change %" tick={{ fontSize: 10, fill: 'var(--text3)' }} axisLine={false} tickLine={false} label={{ value: 'Price Chg %', angle: -90, position: 'insideLeft', fill: 'var(--text3)', fontSize: 10 }} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: 'var(--border2)' }}
                      contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v, name) => [v.toFixed(4), name]}
                    />
                    <Scatter data={scatterData} fill="var(--accent)" fillOpacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Data table */}
            <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                <span className="chart-title" style={{ marginBottom: 0 }}>Snapshot Data</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Date</th>
                    <th>Avg. Sentiment</th>
                    <th>Price ($)</th>
                    <th>Change %</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.company}</td>
                      <td className="text-muted2">{s.date}</td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{(s.avg_sentiment || 0).toFixed(4)}</td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{s.stock_price ? `$${parseFloat(s.stock_price).toFixed(2)}` : '—'}</td>
                      <td style={{ fontFamily: 'var(--mono)', color: s.price_change_pct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {s.price_change_pct != null ? `${s.price_change_pct > 0 ? '+' : ''}${parseFloat(s.price_change_pct).toFixed(2)}%` : '—'}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(s.id)} title="Delete">
                          <Icon.Trash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      }
    </>
  )
}
