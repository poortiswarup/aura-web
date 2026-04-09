require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const pgSession = require("connect-pg-simple")(session);

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Create session table
pool.query(`
  CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
  )
`).catch(console.error);
const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ── Data helpers ──────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(file) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); } catch { return []; }
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || "aura-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true,
    httpOnly: true, 
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'none'
  }
}));

// ── Passport / Google OAuth ───────────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === "production"
  ? `https://aura-affective-risk-and-uncertainity.onrender.com/auth/google/callback`
  : `http://localhost:${PORT}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
  const users = readJSON("users.json");
  let user = users.find(u => u.googleId === profile.id);
  if (!user) {
    user = {
      id:         uuidv4(),
      googleId:   profile.id,
      name:       profile.displayName,
      email:      profile.emails?.[0]?.value || "",
      avatar:     profile.photos?.[0]?.value || "",
      createdAt:  new Date().toISOString()
    };
    users.push(user);
    writeJSON("users.json", users);
    // Seed empty data files for new user
    writeJSON(`articles_${user.id}.json`, []);
    writeJSON(`companies_${user.id}.json`, []);
    writeJSON(`snapshots_${user.id}.json`, []);
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const users = readJSON("users.json");
  done(null, users.find(u => u.id === id) || null);
});

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// ── Auth routes ───────────────────────────────────────────────────────────────
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${CLIENT_URL}/login?error=1` }),
  (req, res) => res.redirect(`${CLIENT_URL}/dashboard`)
);

app.post("/auth/logout", (req, res) => {
  req.logout(() => res.json({ ok: true }));
});

app.get("/auth/me", (req, res) => {
  if (!req.user) return res.json(null);
  const { id, name, email, avatar, createdAt } = req.user;
  res.json({ id, name, email, avatar, createdAt });
});

// ── Sentiment scoring (server-side JS port of Python VADER-style) ─────────────
// Simplified lexicon-based scoring (no Python dep needed for the web app)
const POSITIVE_WORDS = new Set(["surge","beat","profit","growth","record","strong","positive","gain","rise","up","increase","expand","revenue","acquisition","innovation","launch","success","milestone","award","partnership"]);
const NEGATIVE_WORDS = new Set(["fall","loss","decline","miss","weak","negative","drop","cut","layoff","lawsuit","fine","fraud","risk","debt","crisis","warning","recall","down","decrease","shortfall","concern"]);

function simpleSentiment(text) {
  const tokens = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
  let pos = 0, neg = 0;
  tokens.forEach(t => {
    if (POSITIVE_WORDS.has(t)) pos++;
    if (NEGATIVE_WORDS.has(t)) neg++;
  });
  const total = tokens.length || 1;
  const score = Math.max(-1, Math.min(1, (pos - neg) / Math.sqrt(total)));
  // Add slight noise per model to simulate multi-model spread
  const jitter = () => (Math.random() - 0.5) * 0.15;
  const vader     = Math.max(-1, Math.min(1, score + jitter()));
  const textblob  = Math.max(-1, Math.min(1, score + jitter()));
  const lm        = Math.max(-1, Math.min(1, score * 0.9 + jitter()));
  const finbert   = Math.max(-1, Math.min(1, score * 1.1 + jitter()));
  const aggregate = (vader + textblob + lm + finbert) / 4;

  let label = "neutral";
  if (aggregate >= 0.5)       label = "very_positive";
  else if (aggregate >= 0.15) label = "positive";
  else if (aggregate <= -0.5) label = "very_negative";
  else if (aggregate <= -0.15) label = "negative";

  return { vader_score: +vader.toFixed(4), textblob_score: +textblob.toFixed(4),
           lm_score: +lm.toFixed(4), finbert_score: +finbert.toFixed(4),
           aggregate_score: +aggregate.toFixed(4), sentiment_label: label };
}

// ── Articles API ──────────────────────────────────────────────────────────────
app.get("/api/articles", requireAuth, (req, res) => {
  res.json(readJSON(`articles_${req.user.id}.json`));
});

app.post("/api/articles", requireAuth, (req, res) => {
  const { headline, company, source, publish_date } = req.body;
  if (!headline) return res.status(400).json({ error: "headline required" });
  const scores = simpleSentiment(headline);
  const article = {
    id: uuidv4(), headline, company: (company || "").toUpperCase(),
    source, publish_date, created_date: new Date().toISOString(), ...scores
  };
  const articles = readJSON(`articles_${req.user.id}.json`);
  articles.unshift(article);
  writeJSON(`articles_${req.user.id}.json`, articles);
  res.json(article);
});

app.delete("/api/articles/:id", requireAuth, (req, res) => {
  let articles = readJSON(`articles_${req.user.id}.json`);
  articles = articles.filter(a => a.id !== req.params.id);
  writeJSON(`articles_${req.user.id}.json`, articles);
  res.json({ ok: true });
});

// ── Companies API ─────────────────────────────────────────────────────────────
app.get("/api/companies", requireAuth, (req, res) => {
  const companies = readJSON(`companies_${req.user.id}.json`);
  const articles  = readJSON(`articles_${req.user.id}.json`);
  // Auto-sync sentiment
  const updated = companies.map(c => {
    const arts = articles.filter(a => a.company === c.ticker && a.aggregate_score != null);
    if (!arts.length) return c;
    const avg = arts.reduce((s, a) => s + a.aggregate_score, 0) / arts.length;
    const sorted = [...arts].sort((a,b) => a.created_date.localeCompare(b.created_date));
    const half = Math.floor(sorted.length / 2);
    const older = sorted.slice(0, half).reduce((s,a) => s + a.aggregate_score, 0) / Math.max(half, 1);
    const newer = sorted.slice(half).reduce((s,a) => s + a.aggregate_score, 0) / Math.max(sorted.length - half, 1);
    const trend = newer - older > 0.05 ? "rising" : older - newer > 0.05 ? "falling" : "stable";
    const risk  = avg < -0.5 ? "critical" : avg < -0.2 ? "high" : avg < 0.1 ? "moderate" : "low";
    return { ...c, latest_sentiment: +avg.toFixed(4), sentiment_trend: trend, risk_level: risk };
  });
  writeJSON(`companies_${req.user.id}.json`, updated);
  res.json(updated);
});

app.post("/api/companies", requireAuth, (req, res) => {
  const { ticker, name, sector } = req.body;
  if (!ticker || !name) return res.status(400).json({ error: "ticker and name required" });
  const companies = readJSON(`companies_${req.user.id}.json`);
  if (companies.find(c => c.ticker === ticker.toUpperCase()))
    return res.status(409).json({ error: "already tracked" });
  const company = { id: uuidv4(), ticker: ticker.toUpperCase(), name, sector: sector || null,
                    latest_sentiment: null, sentiment_trend: "stable", risk_level: "low",
                    created_at: new Date().toISOString() };
  companies.push(company);
  writeJSON(`companies_${req.user.id}.json`, companies);
  res.json(company);
});

app.delete("/api/companies/:id", requireAuth, (req, res) => {
  let companies = readJSON(`companies_${req.user.id}.json`);
  companies = companies.filter(c => c.id !== req.params.id);
  writeJSON(`companies_${req.user.id}.json`, companies);
  res.json({ ok: true });
});

// ── Snapshots API ─────────────────────────────────────────────────────────────
app.get("/api/snapshots", requireAuth, (req, res) => {
  res.json(readJSON(`snapshots_${req.user.id}.json`));
});

app.post("/api/snapshots", requireAuth, (req, res) => {
  const snap = { id: uuidv4(), ...req.body, created_at: new Date().toISOString() };
  const snaps = readJSON(`snapshots_${req.user.id}.json`);
  snaps.push(snap);
  writeJSON(`snapshots_${req.user.id}.json`, snaps);
  res.json(snap);
});

app.delete("/api/snapshots/:id", requireAuth, (req, res) => {
  let snaps = readJSON(`snapshots_${req.user.id}.json`);
  snaps = snaps.filter(s => s.id !== req.params.id);
  writeJSON(`snapshots_${req.user.id}.json`, snaps);
  res.json({ ok: true });
});

// ── Serve built client in production ─────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../client/dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

app.listen(PORT, () => console.log(`✅ AURA server running on http://localhost:${PORT}`));
