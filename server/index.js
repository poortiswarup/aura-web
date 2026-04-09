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

const PORT = process.env.PORT || 10000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ✅ PostgreSQL connection (SAFE)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Prevent crash if DB fails
pool.connect()
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// ── Data helpers ─────────────────────────────────────────
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

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(express.json());

// ✅ SAFE session config (FIXED)
app.use(session({
  store: process.env.NODE_ENV === "production"
    ? new pgSession({ pool, createTableIfMissing: true })
    : undefined,
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Passport ─────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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

// ── Auth middleware ──────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// ── Routes ───────────────────────────────────────────────
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

// ── Simple test DB route ─────────────────────────────────
app.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB ERROR");
  }
});

// ── Serve frontend ───────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../client/dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// ── Start server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});