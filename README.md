# RankForge Pro — AI-Powered SEO Intelligence Platform

A full-stack SEO analysis platform powered by Claude AI with web search capabilities.

## 🎯 Features

### 4 Main Tools
1. **SEO Audit** — Scrapes any URL and analyzes 20+ SEO factors using AI
2. **Competitor Analysis** — Compare your domain vs up to 3 competitors
3. **DA/PA Checker** — Domain Authority, Page Authority, and 12+ metrics
4. **Keyword Research** — Search volume, difficulty, PAA, long-tails, and more

### Additional Features
- 🔐 License key system with free/pro/agency tiers
- 📊 Admin panel for key management and analytics
- 📄 PDF export for audit reports
- 📋 Copy results as JSON
- 📜 History of last 10 analyses
- 🌗 Dark/light mode toggle
- ⚡ Loading skeleton animations
- 🔔 Toast notifications
- 📱 Responsive mobile layout

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express |
| AI | Anthropic Claude (claude-sonnet-4-20250514 + web_search) |
| Database | Supabase (PostgreSQL) |
| Fonts | Syne (headings) + JetBrains Mono (data) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
SUPABASE_URL=https://xxx.supabase.co      # Optional
SUPABASE_ANON_KEY=xxx                       # Optional
SUPABASE_SERVICE_KEY=xxx                    # Optional
ADMIN_PASSWORD=your_admin_password
FRONTEND_URL=http://localhost:5174
PORT=3001
```

### 3. Run

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open http://localhost:5174

## 🔑 License Keys

### Free Demo Key
```
FAIZAN007-LIFETIME-FREE
```
This key works out of the box — no Supabase needed.

### Plans
| Plan | Limit | Duration |
|------|-------|----------|
| Free Lifetime | 50 analyses | Forever |
| Pro Monthly | 500/month | 30 days |
| Pro Yearly | 500/month | 365 days |
| Agency | 2000/month | 365 days |

## 🛡️ Admin Panel

Visit `/admin` and enter the admin password to:
- Generate license keys (bulk or single)
- View all active keys
- Revoke keys
- View usage analytics

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/activate` | Validate license key |
| POST | `/api/seo-audit` | Run SEO audit |
| POST | `/api/competitor` | Competitor analysis |
| POST | `/api/da-pa` | DA/PA check |
| POST | `/api/keywords` | Keyword research |
| GET | `/api/usage` | Get usage data |
| POST | `/api/extension/bar` | Chrome extension data |
| POST | `/api/admin/generate-key` | Generate keys |
| GET | `/api/admin/keys` | List all keys |
| POST | `/api/admin/revoke-key` | Revoke a key |
| GET | `/api/admin/analytics` | Usage analytics |

All protected routes require `Authorization: Bearer <license_key>` header.

## 🚀 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```

### Backend → Railway
```bash
cd server
# Push to Railway with environment variables configured
```

## 📁 Project Structure

```
rankforge-pro/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SeoAuditTab.jsx
│   │   │   ├── CompetitorTab.jsx
│   │   │   ├── DapaTab.jsx
│   │   │   ├── KeywordTab.jsx
│   │   │   ├── ScoreCircle.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── HistoryPanel.jsx
│   │   │   └── PaywallModal.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── vite.config.js
├── server/                    # Express backend
│   ├── lib/
│   │   ├── claude.js          # Claude API integration
│   │   ├── supabase.js        # Supabase + license system
│   │   └── scraper.js         # Page scraper
│   ├── routes/
│   │   ├── activate.js
│   │   ├── seoAudit.js
│   │   ├── competitor.js
│   │   ├── dapa.js
│   │   ├── keywords.js
│   │   ├── usage.js
│   │   ├── admin.js
│   │   └── extension.js
│   ├── index.js
│   └── .env
└── README.md
```

## 🎨 Color Theme

| Token | Color |
|-------|-------|
| Background | `#07070F` |
| Primary Purple | `#7B2FFF` |
| Accent | `#C084FC` |
| Success | `#00FF94` |
| Warning | `#FFD700` |
| Error | `#FF4D4D` |
| Text | `#E2E0F0` |

---

Built with ❤️ by RankForge Pro
