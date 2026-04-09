import { useState, useEffect } from 'react'
import axios from 'axios'
import { SentimentPill, Gauge, Panel, Alert, Spinner, EmptyState } from '../components/ui'
import { Icon } from '../components/icons'

const fmt = d => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } catch { return d } }

export default function NewsFeed() {
  const [articles,   setArticles]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')
  const [form,       setForm]       = useState({ headline: '', company: '', source: '', publish_date: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  const load = () => axios.get('/api/articles').then(r => setArticles(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.headline.trim()) { setError('Headline is required.'); return }
    setError(''); setSuccess(''); setSubmitting(true)
    try {
      const res = await axios.post('/api/articles', form)
      setSuccess(`Analysis complete — scored ${res.data.aggregate_score?.toFixed(4)}`)
      setForm({ headline: '', company: '', source: '', publish_date: '' })
      load()
    } catch { setError('Failed to submit article. Please try again.') }
    finally { setSubmitting(false) }
  }

  const del = async id => {
    await axios.delete(`/api/articles/${id}`)
    setArticles(a => a.filter(x => x.id !== id))
  }

  const filtered = articles.filter(a =>
    (filter === 'all' || a.sentiment_label === filter) &&
    (!search || a.headline?.toLowerCase().includes(search.toLowerCase()) ||
                a.company?.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <Spinner large />

  return (
    <>
      <div className="page-header">
        <div className="page-title">News Feed</div>
        <div className="page-subtitle">Submit headlines for multi-model NLP sentiment analysis</div>
      </div>

      {/* Analyze form */}
      <Panel title="Submit Article for Analysis" defaultOpen={articles.length === 0}>
        {error   && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="form-group">
          <label className="form-label">Headline <span>*</span></label>
          <textarea
            className="input"
            placeholder="Paste a financial news headline…"
            value={form.headline}
            onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
          />
        </div>

        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Ticker / Company</label>
            <input className="input" placeholder="e.g. AAPL" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Source</label>
            <input className="input" placeholder="e.g. Reuters" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Publish Date</label>
            <input className="input" type="date" value={form.publish_date} onChange={e => setForm(f => ({ ...f, publish_date: e.target.value }))} />
          </div>
        </div>

        <button className="btn btn-primary" onClick={submit} disabled={submitting}>
          <Icon.Search />
          {submitting ? 'Analyzing…' : 'Run Sentiment Analysis'}
        </button>
      </Panel>

      {/* Filters */}
      <div className="search-row">
        <input
          className="input"
          placeholder="Search headlines or tickers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input select"
          style={{ width: 200, flexShrink: 0 }}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Sentiments</option>
          <option value="very_positive">Very Positive</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
          <option value="very_negative">Very Negative</option>
        </select>
      </div>

      {/* Count */}
      {articles.length > 0 && (
        <div className="text-sm text-muted2" style={{ marginBottom: 12 }}>
          Showing {filtered.length} of {articles.length} articles
        </div>
      )}

      {/* Articles */}
      {filtered.length === 0
        ? <EmptyState
            icon={Icon.FileText}
            title="No articles found"
            sub={articles.length === 0 ? 'Use the form above to analyze your first headline' : 'Try adjusting your search or filter'}
          />
        : filtered.map(a => (
          <div key={a.id} className="article-row">
            <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
              {a.company    && <span className="article-ticker">{a.company}</span>}
              {a.source     && <span className="article-meta">· {a.source}</span>}
              {a.publish_date && <span className="article-meta">· {fmt(a.publish_date)}</span>}
              <span style={{ marginLeft: 'auto' }}><SentimentPill label={a.sentiment_label} /></span>
            </div>

            <div className="article-headline">{a.headline}</div>

            <div className="grid-4" style={{ marginBottom: 12 }}>
              <Gauge score={a.vader_score}    modelLabel="VADER" />
              <Gauge score={a.textblob_score} modelLabel="TextBlob" />
              <Gauge score={a.lm_score}       modelLabel="L-M" />
              <Gauge score={a.finbert_score}  modelLabel="FinBERT" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted2">
                Aggregate score:&nbsp;
                <span className="font-mono" style={{ color: 'var(--text)' }}>{(a.aggregate_score || 0).toFixed(4)}</span>
              </span>
              <button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>
                <Icon.Trash />
                Delete
              </button>
            </div>
          </div>
        ))
      }
    </>
  )
}
