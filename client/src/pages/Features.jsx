import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import { Link } from 'react-router-dom'

const MODELS = [
  {
    name: 'VADER',
    full: 'Valence Aware Dictionary and sEntiment Reasoner',
    tag: 'General purpose',
    color: '#ec4899',
    desc: 'A lexicon and rule-based sentiment analysis tool specifically designed for social media and short texts. VADER uses a dictionary of words rated for valence and applies grammatical rules like negation and punctuation boosting.',
    strengths: ['Fast — no model loading', 'Handles slang and abbreviations', 'Captures sentiment intensity'],
  },
  {
    name: 'TextBlob',
    full: 'Pattern-based polarity & subjectivity',
    tag: 'Pattern matching',
    color: '#0d9488',
    desc: 'A simple NLP library that uses a pattern-based approach and a pre-trained classifier. TextBlob returns both polarity (positive/negative) and subjectivity (objective/opinionated), giving a second dimension to the analysis.',
    strengths: ['Subjectivity score included', 'Consistent on formal prose', 'Good baseline for comparison'],
  },
  {
    name: 'Loughran-McDonald',
    full: 'Finance-specific lexicon from SEC filings',
    tag: 'Finance specialist',
    color: '#9333ea',
    desc: 'A sentiment dictionary built specifically from 10-K SEC filings. Words like "liability", "risk", and "loss" are correctly classified as negative in financial context, whereas general lexicons often miss this nuance.',
    strengths: ['Finance-domain vocabulary', 'Built on real corporate filings', 'Catches regulatory language'],
  },
  {
    name: 'FinBERT',
    full: 'BERT fine-tuned on financial communications',
    tag: 'Deep learning',
    color: '#ea580c',
    desc: 'A transformer model (BERT) fine-tuned on financial news and earnings calls. FinBERT understands context and word relationships, making it the most sophisticated model in the ensemble — but also the most sensitive to phrasing.',
    strengths: ['Context-aware scoring', 'Trained on financial text', 'Highest precision on complex sentences'],
  },
]

const PAGES = [
  {
    name: 'Dashboard',
    desc: 'Your command centre. See total articles, tracked companies, average sentiment, and risk alerts at a glance. A live sentiment trend chart shows how your portfolio mood has evolved over time.',
    bullets: ['Metric overview cards', 'Sentiment trend line chart', 'Recent articles summary', 'Company risk table'],
  },
  {
    name: 'News Feed',
    desc: 'Submit any financial headline and get a full multi-model breakdown in under a second. Filter by sentiment label, search by ticker or keyword, and delete articles you no longer need.',
    bullets: ['One-click submission form', 'Four model gauge bars per article', 'Filter by Very Positive → Very Negative', 'Search across all your headlines'],
  },
  {
    name: 'Companies',
    desc: 'Track any ticker. AURA automatically computes sentiment averages and trends from all articles tagged with that ticker, showing you risk level in real time.',
    bullets: ['Add any ticker + company name', 'Auto-synced sentiment from articles', 'Rising / Stable / Falling trend indicator', 'Risk level: Low → Critical'],
  },
  {
    name: 'Sentiment',
    desc: 'Deep dive into your article library. See how sentiment distributes across categories, how the four models compare, and filter everything by company.',
    bullets: ['Pie chart: sentiment distribution', 'Radar chart: model agreement', 'Bar chart: average score per model', 'Filter by company ticker'],
  },
  {
    name: 'Market',
    desc: 'The research page. Log sentiment alongside stock price data and AURA computes Pearson correlation — telling you whether news sentiment actually predicts price movements for a given ticker.',
    bullets: ['Manual snapshot entry', 'Dual-axis: sentiment vs price', 'Scatter plot correlation view', 'Pearson r with signal strength'],
  },
]

export default function Features() {
  return (
    <div className="pub-page">
      <PublicNav />

      {/* Hero */}
      <section className="pub-page-hero">
        <div className="pub-container">
          <div className="pub-eyebrow">Features</div>
          <h1 className="pub-page-title">Built for financial clarity</h1>
          <p className="pub-page-sub">
            Four NLP models. Five analytical views. One aggregated truth about what the market is feeling.
          </p>
        </div>
      </section>

      {/* Models */}
      <section className="pub-section">
        <div className="pub-container">
          <div className="pub-section-header">
            <div className="pub-eyebrow">The engine</div>
            <h2 className="pub-section-title">Four models, one score</h2>
            <p className="pub-section-sub">Each model has different strengths. AURA uses all four and averages the result so no single bias dominates.</p>
          </div>
          <div className="models-detail-grid">
            {MODELS.map(m => (
              <div key={m.name} className="model-detail-card">
                <div className="model-detail-card__header">
                  <div>
                    <span className="model-detail-card__tag" style={{ borderColor: m.color, color: m.color }}>{m.tag}</span>
                    <h3 className="model-detail-card__name">{m.name}</h3>
                    <div className="model-detail-card__full">{m.full}</div>
                  </div>
                  <div className="model-detail-card__dot" style={{ background: m.color }} />
                </div>
                <p className="model-detail-card__desc">{m.desc}</p>
                <div className="model-detail-card__strengths">
                  {m.strengths.map(s => (
                    <div key={s} className="model-detail-card__strength">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={m.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pages */}
      <section className="pub-section pub-section--tinted">
        <div className="pub-container">
          <div className="pub-section-header">
            <div className="pub-eyebrow">Five views</div>
            <h2 className="pub-section-title">Every page has a purpose</h2>
          </div>
          <div className="pages-list">
            {PAGES.map((p, i) => (
              <div key={p.name} className="pages-list__item">
                <div className="pages-list__num">0{i + 1}</div>
                <div className="pages-list__content">
                  <h3 className="pages-list__name">{p.name}</h3>
                  <p className="pages-list__desc">{p.desc}</p>
                  <div className="pages-list__bullets">
                    {p.bullets.map(b => (
                      <span key={b} className="pages-list__bullet">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pub-section cta-section">
        <div className="pub-container">
          <div className="cta-box">
            <div className="cta-box__orb" />
            <h2 className="cta-box__title">Try all five views for free</h2>
            <p className="cta-box__sub">Sign in with Google and start analysing headlines immediately.</p>
            <Link to="/login" className="btn btn-hero-primary" style={{ fontSize: 15, padding: '12px 32px' }}>Get started</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
