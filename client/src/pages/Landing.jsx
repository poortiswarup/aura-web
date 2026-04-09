import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'

const STATS = [
  { value: '4',    label: 'NLP Models' },
  { value: '100%', label: 'Private data' },
  { value: '< 1s', label: 'Analysis speed' },
  { value: '∞',    label: 'Headlines tracked' },
]

const FEATURES = [
  {
    icon: <BrainIcon />,
    title: 'Multi-model NLP',
    desc: 'Every headline scored by VADER, TextBlob, Loughran-McDonald, and FinBERT simultaneously for maximum accuracy.',
  },
  {
    icon: <ChartIcon />,
    title: 'Market correlation',
    desc: 'Plot sentiment against price movements to discover whether news actually moves your stocks.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Risk intelligence',
    desc: 'Automatic risk classification — Low, Moderate, High, Critical — updated live as new articles come in.',
  },
  {
    icon: <CompanyIcon />,
    title: 'Company tracking',
    desc: 'Monitor any ticker. Sentiment trends and risk levels computed automatically from your article library.',
  },
]

const STEPS = [
  { num: '01', title: 'Sign in with Google', desc: 'One click. Your data is private and tied to your account only.' },
  { num: '02', title: 'Paste a headline',    desc: 'Drop any financial news headline into the News Feed analyser.' },
  { num: '03', title: 'Read the scores',     desc: 'Get instant multi-model sentiment scores, a label, and gauge bars.' },
  { num: '04', title: 'Track the trend',     desc: 'Watch sentiment shift over time on the Dashboard and Market pages.' },
]

export default function Landing() {
  return (
    <div className="pub-page">
      <PublicNav />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg-orb hero__bg-orb--1" />
        <div className="hero__bg-orb hero__bg-orb--2" />
        <div className="pub-container hero__inner">
          <div className="hero__badge">Financial Sentiment Intelligence</div>
          <h1 className="hero__title">
            Understand the <em>mood</em><br />behind the market
          </h1>
          <p className="hero__sub">
            AURA analyses financial news headlines through four NLP models at once,
            giving you a clear, aggregated picture of market sentiment — in under a second.
          </p>
          <div className="hero__cta">
            <Link to="/login" className="btn btn-hero-primary">Start analysing free</Link>
            <Link to="/features" className="btn btn-hero-secondary">See how it works</Link>
          </div>

          {/* Mock dashboard preview */}
          <div className="hero__preview">
            <div className="hero__preview-bar">
              <span className="hero__preview-dot" style={{ background: '#f87171' }} />
              <span className="hero__preview-dot" style={{ background: '#fbbf24' }} />
              <span className="hero__preview-dot" style={{ background: '#4ade80' }} />
              <span className="hero__preview-url">aura-analytics.app/dashboard</span>
            </div>
            <div className="hero__preview-body">
              <div className="hero__preview-metrics">
                {[['Articles', '142'], ['Companies', '8'], ['Avg. Score', '0.2341'], ['Risk Alerts', '2']].map(([l, v]) => (
                  <div key={l} className="hero__preview-metric">
                    <div className="hero__preview-metric-label">{l}</div>
                    <div className="hero__preview-metric-value">{v}</div>
                  </div>
                ))}
              </div>
              <div className="hero__preview-articles">
                {[
                  { ticker: 'AAPL', score: 'Very Positive', color: '#16a34a', headline: 'Apple reports record Q4 revenue, beats analyst expectations by 12%' },
                  { ticker: 'TSLA', score: 'Negative',      color: '#ea580c', headline: 'Tesla faces renewed scrutiny over autopilot safety concerns' },
                  { ticker: 'MSFT', score: 'Positive',      color: '#0d9488', headline: 'Microsoft Azure growth accelerates, cloud division up 28% YoY' },
                ].map(a => (
                  <div key={a.ticker} className="hero__preview-article">
                    <div className="hero__preview-article-top">
                      <span className="hero__preview-ticker">{a.ticker}</span>
                      <span className="hero__preview-score" style={{ color: a.color }}>{a.score}</span>
                    </div>
                    <div className="hero__preview-headline">{a.headline}</div>
                    <div className="hero__preview-gauges">
                      {[62, 58, 54, 70].map((w, i) => (
                        <div key={i} className="hero__preview-gauge">
                          <div className="hero__preview-gauge-track">
                            <div className="hero__preview-gauge-fill" style={{ width: `${w}%`, background: a.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="pub-section pub-section--tinted">
        <div className="pub-container">
          <div className="stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="pub-section">
        <div className="pub-container">
          <div className="pub-section-header">
            <div className="pub-eyebrow">What AURA does</div>
            <h2 className="pub-section-title">Everything you need to read the market's mood</h2>
            <p className="pub-section-sub">Four pages, four perspectives. All your sentiment data in one place.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="pub-section pub-section--tinted">
        <div className="pub-container">
          <div className="pub-section-header">
            <div className="pub-eyebrow">How it works</div>
            <h2 className="pub-section-title">From headline to insight in four steps</h2>
          </div>
          <div className="steps-grid">
            {STEPS.map(s => (
              <div key={s.num} className="step-card">
                <div className="step-card__num">{s.num}</div>
                <h3 className="step-card__title">{s.title}</h3>
                <p className="step-card__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Models callout ────────────────────────────────────── */}
      <section className="pub-section">
        <div className="pub-container">
          <div className="models-section">
            <div className="models-section__text">
              <div className="pub-eyebrow">Four models, one score</div>
              <h2 className="pub-section-title" style={{ textAlign: 'left', maxWidth: '100%' }}>
                No single model tells the whole story
              </h2>
              <p className="pub-section-sub" style={{ textAlign: 'left', maxWidth: '100%' }}>
                Financial language is nuanced. A word that's positive in everyday English might be a warning sign in an earnings report. AURA runs every headline through four specialist models and aggregates the result.
              </p>
              <Link to="/features" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
                See the full breakdown
              </Link>
            </div>
            <div className="models-section__cards">
              {[
                { name: 'VADER', desc: 'Valence Aware Dictionary — fast general-purpose sentiment scoring', score: 0.62 },
                { name: 'TextBlob', desc: 'Pattern-based polarity and subjectivity analysis', score: 0.58 },
                { name: 'Loughran-McDonald', desc: 'Finance-specific lexicon built from 10-K filings', score: 0.54 },
                { name: 'FinBERT', desc: 'BERT fine-tuned on financial communications', score: 0.71 },
              ].map(m => (
                <div key={m.name} className="model-card">
                  <div className="model-card__header">
                    <span className="model-card__name">{m.name}</span>
                    <span className="model-card__score">{m.score.toFixed(3)}</span>
                  </div>
                  <div className="model-card__desc">{m.desc}</div>
                  <div className="model-card__track">
                    <div className="model-card__fill" style={{ width: `${((m.score + 1) / 2) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="pub-section cta-section">
        <div className="pub-container">
          <div className="cta-box">
            <div className="cta-box__orb" />
            <h2 className="cta-box__title">Start reading the market's emotions today</h2>
            <p className="cta-box__sub">Free to use. Sign in with Google. No setup required.</p>
            <Link to="/login" className="btn btn-hero-primary" style={{ fontSize: 15, padding: '12px 32px' }}>
              Get started — it's free
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

function BrainIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14"/></svg>
}
function ChartIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
}
function ShieldIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function CompanyIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7v14M21 7v14M6 21V3l6-2 6 2v18M9 21v-4h6v4"/></svg>
}
