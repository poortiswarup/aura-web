# AURA Analytics

**Affective Uncertainty & Risk Analytics** — a full-stack web application for financial news sentiment analysis using multi-model NLP.

## Features

- **Google OAuth login** — per-user private data, no passwords
- **News Feed** — submit headlines; scored instantly by VADER, TextBlob, Loughran-McDonald, and FinBERT models
- **Companies** — track tickers, auto-sync risk levels from article sentiment
- **Sentiment** — distribution charts, model radar, average score comparison
- **Market Correlation** — Pearson correlation between sentiment and stock price movement; scatter and dual-axis line charts
- **Dark theme** — professional design system throughout

---

## Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 19 + Vite, Recharts               |
| Backend  | Node.js + Express                       |
| Auth     | Passport.js + Google OAuth 2.0          |
| Data     | JSON files (local, per-user)            |
| NLP      | Lexicon-based JS engine (VADER-inspired)|

---

## Setup

### 1. Clone / unzip the project

```bash
cd aura
```

### 2. Install dependencies

```bash
# Root (server deps)
npm install

# Client deps
cd client && npm install && cd ..
```

### 3. Configure Google OAuth

**Create OAuth credentials:**

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Add Authorized redirect URI:
   ```
   http://localhost:3001/auth/google/callback
   ```
7. Copy the **Client ID** and **Client Secret**

**Create your `.env` file:**

```bash
cp .env.example .env
```

Edit `.env`:

```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
SESSION_SECRET=any_long_random_string_here
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Run in development

```bash
npm run dev
```

This starts both the Express server (port 3001) and the Vite dev server (port 5173).

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build

```bash
# Build the React client
npm run build

# Set NODE_ENV=production in .env, then:
npm start
```

In production mode, Express serves the built client from `client/dist`. Everything runs on a single port (3001).

Update your Google OAuth redirect URI to your production domain:
```
https://yourdomain.com/auth/google/callback
```

And update `.env`:
```env
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Project Structure

```
aura/
├── server/
│   ├── index.js          # Express server, Passport OAuth, all API routes
│   └── data/             # Auto-created — JSON data files per user
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx    # Sidebar + app shell
│   │   │   ├── icons.jsx     # SVG icon set
│   │   │   └── ui.jsx        # Shared UI components
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewsFeed.jsx
│   │   │   ├── Companies.jsx
│   │   │   ├── Sentiment.jsx
│   │   │   └── Market.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css         # Full design system
│   └── vite.config.js
├── .env.example
├── package.json
└── README.md
```

---

## API Endpoints

All endpoints (except auth) require a valid session cookie from Google login.

| Method | Path                    | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/auth/google`          | Redirect to Google login           |
| GET    | `/auth/google/callback` | OAuth callback                     |
| POST   | `/auth/logout`          | Clear session                      |
| GET    | `/auth/me`              | Current user info                  |
| GET    | `/api/articles`         | List articles                      |
| POST   | `/api/articles`         | Submit headline for analysis       |
| DELETE | `/api/articles/:id`     | Delete article                     |
| GET    | `/api/companies`        | List companies (with synced scores)|
| POST   | `/api/companies`        | Add company                        |
| DELETE | `/api/companies/:id`    | Remove company                     |
| GET    | `/api/snapshots`        | List market snapshots              |
| POST   | `/api/snapshots`        | Add snapshot                       |
| DELETE | `/api/snapshots/:id`    | Delete snapshot                    |

---

## Data Storage

User data is stored as JSON files in `server/data/`:

```
server/data/
├── users.json
├── articles_{userId}.json
├── companies_{userId}.json
└── snapshots_{userId}.json
```

Each Google account gets completely isolated data. To upgrade to a database (PostgreSQL, SQLite, MongoDB), replace the `readJSON`/`writeJSON` helpers in `server/index.js` with your ORM of choice.

---

## Deploying to Render / Railway / Fly.io

1. Push the project to a GitHub repository
2. Create a new **Web Service** pointing to the repo
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add all `.env` variables in the platform's environment settings
6. Update the Google OAuth redirect URI to your deployed URL
