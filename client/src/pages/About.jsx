import PublicNav from '../components/PublicNav'
import PublicFooter from '../components/PublicFooter'
import { Link } from 'react-router-dom'

const TIMELINE = [
  { year: '2024', title: 'Project started', desc: 'AURA began as an academic project exploring multi-model NLP for financial text analysis.' },
  { year: '2024', title: 'Four models integrated', desc: 'VADER, TextBlob, Loughran-McDonald, and FinBERT were unified into a single scoring pipeline.' },
  { year: '2025', title: 'Web platform launched', desc: 'The full-stack web app went live with Google OAuth, persistent storage, and five analytical views.' },
  { year: '2025', title: 'Market correlation added', desc: 'Pearson correlation between sentiment scores and stock price changes became the flagship research feature.' },
]

const VALUES = [
  { title: 'Transparency', desc: 'Every model score is shown individually. You see VADER, TextBlob, L-M, and FinBERT separately — not just a black-box number.' },
  { title: 'Privacy first', desc: 'All your articles and companies are scoped to your account. No data is shared, sold, or used for training.' },
  { title: 'Research-grade', desc: 'AURA was built on the same techniques used in academic financial NLP research, not just social-media sentiment tools.' },
]

export default function About() {
  return (
    <div className="pub-page">
      <PublicNav />

      {/* Hero */}
      <section className="pub-page-hero">
        <div className="pub-container">
          <div className="pub-eyebrow">About</div>
          <h1 className="pub-page-title">Built to make sentiment legible</h1>
          <p className="pub-page-sub">
            AURA started as a question: why do financial analysts rely on a single sentiment score when every NLP model has different blind spots?
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="pub-section">
        <div className="pub-container">
          <div className="about-story">
            <div className="about-story__text">
              <div className="pub-eyebrow">The story</div>
              <h2 className="pub-section-title" style={{ textAlign: 'left', maxWidth: '100%' }}>
                Why four models instead of one?
              </h2>
              <p className="about-story__para">
                Financial language is deceptive. The word "liability" is neutral in everyday speech but deeply negative in an earnings report. "Record" is positive in a revenue headline but alarming in a lawsuit filing. General-purpose sentiment tools trained on tweets and reviews miss these nuances entirely.
              </p>
              <p className="about-story__para">
                AURA was built to solve this by running every headline through four specialist models — a general lexicon (VADER), a pattern-matcher (TextBlob), a finance-domain dictionary (Loughran-McDonald), and a transformer fine-tuned on financial text (FinBERT) — then aggregating all four into a single score that's more robust than any one alone.
              </p>
              <p className="about-story__para">
                The result is a platform where you can see exactly which model thinks what, track how company sentiment shifts over time, and even test whether the market actually responds to the news sentiment you're measuring.
              </p>
            </div>
            <div className="about-story__stats">
              {[
                ['4', 'NLP models running in parallel'],
                ['5', 'analytical views'],
                ['1', 'aggregated truth'],
                ['0', 'black boxes'],
              ].map(([v, l]) => (
                <div key={l} className="about-stat">
                  <div className="about-stat__value">{v}</div>
                  <div className="about-stat__label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="pub-section pub-section--tinted">
        <div className="pub-container">
          <div className="pub-section-header">
            <div className="pub-eyebrow">Timeline</div>
            <h2 className="pub-section-title">How AURA evolved</h2>
          </div>
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div key={i} className="timeline__item">
                <div className="timeline__year">{t.year}</div>
                <div className="timeline__line">
                  <div className="timeline__dot" />
                  {i < TIMELINE.length - 1 && <div className="timeline__connector" />}
                </div>
                <div className="timeline__content">
                  <h3 className="timeline__title">{t.title}</h3>
                  <p className="timeline__desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="pub-section">
        <div className="pub-container">
          <div className="pub-section-header">
            <div className="pub-eyebrow">Principles</div>
            <h2 className="pub-section-title">What we stand for</h2>
          </div>
          <div className="values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="value-card">
                <div className="value-card__accent" />
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Builder card */}
      <section className="pub-section pub-section--tinted">
        <div className="pub-container">
          <div className="builder-card">
            <div className="builder-card__avatar">PS</div>
            <div className="builder-card__info">
              <h3 className="builder-card__name">Poorti Swarup</h3>
              <div className="builder-card__role">AI/ML & Data Science undergraduate</div>
              <p className="builder-card__bio">
                Building AURA as part of a broader interest in NLP, explainable AI, and financial data science.
                The project spans the full stack — from the sentiment scoring engine in Node.js to the React frontend and Google OAuth integration.
              </p>
              <a href="https://github.com/poortiswarup" target="_blank" rel="noopener noreferrer" className="builder-card__link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                github.com/poortiswarup
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
