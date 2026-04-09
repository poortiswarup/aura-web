require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 10000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ── Data helpers (local JSON storage) ─────────────────────
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(file) {
  try {
    const fp = path.join(DATA_DIR, file);
    if (!fs.existsSync(fp)) return [];
    return JSON.parse(fs.readFileSync(fp, "utf8"));
  } catch {
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(express.json());

// ✅ SIMPLE SESSION (NO POSTGRES)
app.use(session({
  secret: "simple-secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Passport (Google Auth) ────────────────────────────────
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || "dummy",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
  callbackURL: process.env.NODE_ENV === "production"
    ? "https://aura-affective-risk-and-uncertainity.onrender.com/auth/google/callback"
    : `http://localhost:${PORT}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {

  const users = readJSON("users.json");
  let user = users.find(u => u.googleId === profile.id);

  if (!user) {
    user = {
      id: uuidv4(),
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value || "",
      avatar: profile.photos?.[0]?.value || "",
      createdAt: new Date().toISOString()
    };

    users.push(user);
    writeJSON("users.json", users);
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

// ── Auth middleware ───────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// ── Routes ────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("✅ AURA backend running");
});

// Google Auth
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=1`
  }),
  (req, res) => res.redirect(`${CLIENT_URL}/dashboard`)
);

app.post("/auth/logout", (req, res) => {
  req.logout(() => res.json({ ok: true }));
});

app.get("/auth/me", (req, res) => {
  if (!req.user) return res.json(null);
  res.json(req.user);
});

// ── Sentiment logic ───────────────────────────────────────
const POSITIVE_WORDS = new Set(["surge","profit","growth","strong","positive","gain","rise"]);
const NEGATIVE_WORDS = new Set(["fall","loss","decline","weak","negative","drop","risk"]);

function simpleSentiment(text) {
  const tokens = text.toLowerCase().split(/\s+/);
  let pos = 0, neg = 0;

  tokens.forEach(t => {
    if (POSITIVE_WORDS.has(t)) pos++;
    if (NEGATIVE_WORDS.has(t)) neg++;
  });

  const score = (pos - neg) / (tokens.length || 1);

  return {
    aggregate_score: score,
    sentiment_label: score > 0 ? "positive" : score < 0 ? "negative" : "neutral"
  };
}

// ── Articles API ──────────────────────────────────────────
app.get("/api/articles", requireAuth, (req, res) => {
  res.json(readJSON(`articles_${req.user.id}.json`));
});

app.post("/api/articles", requireAuth, (req, res) => {
  const { headline } = req.body;

  const scores = simpleSentiment(headline);

  const article = {
    id: uuidv4(),
    headline,
    created_date: new Date().toISOString(),
    ...scores
  };

  const articles = readJSON(`articles_${req.user.id}.json`);
  articles.unshift(article);
  writeJSON(`articles_${req.user.id}.json`, articles);

  res.json(article);
});

// ── Serve frontend ────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../client/dist");

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// ── Start server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});