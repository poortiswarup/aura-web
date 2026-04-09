import { useState, useEffect } from 'react'
import axios from 'axios'
import { RiskPill, TrendIndicator, Panel, Alert, Spinner, EmptyState } from '../components/ui'
import { Icon } from '../components/icons'

export default function Companies() {
  const [companies,  setCompanies]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [form,       setForm]       = useState({ ticker: '', name: '', sector: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  const load = () => axios.get('/api/companies').then(r => setCompanies(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.ticker.trim() || !form.name.trim()) { setError('Ticker symbol and company name are required.'); return }
    setError(''); setSuccess(''); setSubmitting(true)
    try {
      await axios.post('/api/companies', form)
      setSuccess(`Now tracking ${form.ticker.toUpperCase()}`)
      setForm({ ticker: '', name: '', sector: '' })
      load()
    } catch (e) {
      setError(e.response?.status === 409 ? `${form.ticker.toUpperCase()} is already being tracked.` : 'Failed to add company.')
    } finally { setSubmitting(false) }
  }

  const del = async id => {
    await axios.delete(`/api/companies/${id}`)
    setCompanies(c => c.filter(x => x.id !== id))
  }

  if (loading) return <Spinner large />

  return (
    <>
      <div className="page-header">
        <div className="page-title">Companies</div>
        <div className="page-subtitle">Track companies and monitor sentiment-driven risk levels</div>
      </div>

      {/* Add company form */}
      <Panel title="Track New Company" defaultOpen={companies.length === 0}>
        {error   && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Ticker Symbol <span>*</span></label>
            <input className="input" placeholder="e.g. AAPL" value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Company Name <span>*</span></label>
            <input className="input" placeholder="e.g. Apple Inc." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sector</label>
            <input className="input" placeholder="e.g. Technology" value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={submitting}>
          <Icon.Plus />
          {submitting ? 'Adding…' : 'Add Company'}
        </button>
      </Panel>

      {/* Company grid */}
      {companies.length === 0
        ? <EmptyState icon={Icon.Companies} title="No companies tracked" sub="Use the form above to start monitoring company sentiment" />
        : (
          <div className="company-grid">
            {companies.map(c => {
              const sent = c.latest_sentiment
              return (
                <div key={c.id} className="company-card">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="ticker-avatar">{c.ticker?.slice(0, 3)}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.01em' }}>{c.ticker}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text3)' }}>{c.name}</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {c.sector && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted2">Sector</span>
                        <span style={{ color: 'var(--text2)' }}>{c.sector}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted2">Sentiment</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <TrendIndicator trend={c.sentiment_trend} />
                        {sent != null ? sent.toFixed(4) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-muted2">Risk Level</span>
                      <RiskPill level={c.risk_level} />
                    </div>
                  </div>

                  <button className="btn btn-danger btn-sm w-full" onClick={() => del(c.id)}>
                    <Icon.Trash />
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )
      }
    </>
  )
}
