import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import { Link } from 'react-router-dom'

const PLAN_FEATURES = [
  'Unlimited headline analysis',
  'All four NLP models (VADER, TextBlob, L-M, FinBERT)',
  'Unlimited company tracking',
  'Market correlation analysis',
  'Sentiment trend charts',
  'Private data — your account only',
  'Google OAuth sign-in',
  'Dashboard, News Feed, Companies, Sentiment & Market pages',
]

const FAQS = [
  {
    q: 'Is AURA really free?',
    a: 'Yes. AURA is a personal project and academic portfolio piece. Everything is free to use with a Google account.',
  },
  {
    q: 'Who can see my data?',
    a: 'Only you. All articles, companies, and snapshots are scoped to your Google account. No data is shared with other users or used for any external purpose.',
  },
  {
    q: 'How accurate are the sentiment scores?',
    a: 'Accuracy varies by headline type. FinBERT and Loughran-McDonald tend to be most accurate for formal financial language. The aggregate score smooths out individual model biases.',
  },
  {
    q: 'Can I export my data?',
    a: 'Not currently — export functionality is on the roadmap. For now all data is viewable and deletable within the app.',
  },
  {
    q: 'Is this production-ready for trading decisions?',
    a: 'AURA is an analytical and educational tool, not a trading system. The sentiment scores should be one input among many — not the sole basis for any financial decision.',
  },
  {
    q: 'Will there ever be a paid plan?',
    a: 'Possibly in the future if API access, bulk import, or export features are added. The core app will remain free.',
  },
]

export default function Pricing() {
  return (
    <div className="pub-page">
      <PublicNav />

      {/* Hero */}
      <section className="pub-page-hero">
        <div className="pub-container">
          <div className="pub-eyebrow">Pricing</div>
          <h1 className="pub-page-title">Free. All of it.</h1>
          <p className="pub-page-sub">
            AURA is an open academic project. Every feature is free — no credit card, no trial period, no hidden limits.
          </p>
        </div>
      </section>

      {/* Plan card */}
      <section className="pub-section">
        <div className="pub-container">
          <div className="pricing-center">
            <div className="pricing-card">
              <div className="pricing-card__badge">Everything included</div>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">£0</span>
                <span className="pricing-card__period">/ forever</span>
              </div>
              <p className="pricing-card__desc">
                Sign in with Google and get instant access to the full platform.
              </p>
              <div className="pricing-card__divider" />
              <div className="pricing-card__features">
                {PLAN_FEATURES.map(f => (
                  <div key={f} className="pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="var(--accentSoft)" stroke="var(--border2)"/>
                      <path d="M5 8l2 2 4-4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
              <Link to="/login" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 28, padding: '12px' }}>
                Get started with Google
              </Link>
            </div>

            <div className="pricing-note">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 9v4M10 7h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              AURA is a portfolio and academic project by Poorti Swarup. It may evolve over time — check the About page for updates.
            </div>
          </div>
        </div>
      </section>

      {/* Compare */}
      <section className="pub-section pub-section--tinted">
        <div className="pub-container">
          <div className="pub-section-header">
            <div className="pub-eyebrow">How it compares</div>
            <h2 className="pub-section-title">What you'd pay elsewhere</h2>
            <p className="pub-section-sub">Commercial sentiment APIs charge per call. AURA gives you unlimited access for free.</p>
          </div>
          <div className="compare-table">
            <div className="compare-table__header">
              <div>Feature</div>
              <div>Typical API</div>
              <div className="compare-table__aura">AURA</div>
            </div>
            {[
              ['Multi-model scoring', '$0.01 – $0.10 / call', 'Unlimited free'],
              ['Finance-domain model (FinBERT)', 'Premium tier only', 'Included'],
              ['Company sentiment tracking', 'Manual setup required', 'Automatic'],
              ['Market correlation analysis', 'Not available', 'Built in'],
              ['Private data storage', 'Extra cost', 'Included'],
              ['Dashboard & charts', 'Build it yourself', 'Included'],
            ].map(([feat, api, aura]) => (
              <div key={feat} className="compare-table__row">
                <div className="compare-table__feat">{feat}</div>
                <div className="compare-table__api">{api}</div>
                <div className="compare-table__aura-val">{aura}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pub-section">
        <div className="pub-container">
          <div className="pub-section-header">
            <div className="pub-eyebrow">FAQ</div>
            <h2 className="pub-section-title">Common questions</h2>
          </div>
          <div className="faq-list">
            {FAQS.map(f => (
              <div key={f.q} className="faq-item">
                <h3 className="faq-item__q">{f.q}</h3>
                <p className="faq-item__a">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
