import { Link } from 'react-router-dom'
import { Icon } from './icons'

export default function PublicFooter() {
  return (
    <footer className="pub-footer">
      <div className="pub-footer__inner">
        <div className="pub-footer__brand">
          <div className="pub-footer__logo">
            <div className="pub-nav__logo-mark" style={{ width: 28, height: 28 }}><Icon.Logo /></div>
            <span className="pub-nav__logo-text" style={{ fontSize: 17 }}>AURA</span>
          </div>
          <p className="pub-footer__tagline">Affective Uncertainty &amp; Risk Analytics.<br />Financial sentiment, understood.</p>
        </div>

        <div className="pub-footer__links">
          <div className="pub-footer__col">
            <div className="pub-footer__col-title">Product</div>
            <Link to="/features" className="pub-footer__link">Features</Link>
            <Link to="/pricing"  className="pub-footer__link">Pricing</Link>
            <Link to="/login"    className="pub-footer__link">Sign in</Link>
          </div>
          <div className="pub-footer__col">
            <div className="pub-footer__col-title">Company</div>
            <Link to="/about"   className="pub-footer__link">About</Link>
            <a href="https://github.com/poortiswarup" target="_blank" rel="noopener noreferrer" className="pub-footer__link">GitHub</a>
          </div>
          <div className="pub-footer__col">
            <div className="pub-footer__col-title">Models</div>
            <span className="pub-footer__link pub-footer__link--muted">VADER</span>
            <span className="pub-footer__link pub-footer__link--muted">TextBlob</span>
            <span className="pub-footer__link pub-footer__link--muted">Loughran-McDonald</span>
            <span className="pub-footer__link pub-footer__link--muted">FinBERT</span>
          </div>
        </div>
      </div>
      <div className="pub-footer__bottom">
        <span>© 2025 AURA Analytics. Built by Poorti Swarup.</span>
      </div>
    </footer>
  )
}
