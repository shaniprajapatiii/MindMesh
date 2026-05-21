```

MindMesh/
├── package.json                    ← Monorepo scripts (npm run dev, setup, etc.)
├── docker-compose.yml              ← MongoDB + Redis + Backend + Frontend
├── README.md
│
├── frontend/                       ← Next.js 14 + TypeScript
│   ├── app/
│   │   ├── page.tsx                ← Landing page
│   │   ├── layout.tsx              ← Root layout
│   │   ├── globals.css             ← Custom design system CSS
│   │   ├── not-found.tsx           ← 404 page
│   │   ├── middleware.ts           ← Auth protection
│   │   ├── api/[...path]/          ← Proxy → backend
│   │   ├── api/auth/[...nextauth]/ ← NextAuth handler
│   │   ├── auth/login|register|forgot-password|error/
│   │   ├── onboarding/             ← Post-signup setup
│   │   ├── u/[username]/           ← Public profile
│   │   └── (dashboard)/            ← 14 protected pages:
│   │       dashboard · problems · problems/[id] · editor
│   │       canvas · notes · sheets · roadmap · analytics
│   │       leaderboard · community · news · profile · settings · ai-mentor
│   ├── components/
│   │   ├── ui/index.tsx            ← Button, Badge, Card, Modal, Input, Toggle...
│   │   ├── common/                 ← GlobalSearch, NotificationBell, ErrorBoundary, PageLoader, XPBar
│   │   ├── dashboard/              ← StatCard, ActivityHeatmap, ContestWidget
│   │   ├── problems/               ← ProblemCard
│   │   ├── editor/                 ← LanguageSelector
│   │   ├── canvas/                 ← CanvasToolbar
│   │   └── landing/                ← Nav, Hero, Features, Stats, Sheets, CTA, Footer
│   ├── hooks/index.ts              ← useDebounce, useTimer, useKeyboard, useContestCountdown...
│   ├── lib/api.ts                  ← Typed API client for all 16 endpoints
│   ├── lib/utils.ts                ← cn(), formatters, XP helpers
│   ├── lib/store.ts                ← Zustand global state
│   └── types/index.ts              ← All TypeScript interfaces
│
└── backend/                        ← Node.js + Express + TypeScript
    └── src/
        ├── index.ts                ← Server, Socket.io, cron jobs
        ├── middleware/             ← auth, rateLimiter, validate
        ├── routes/ (16 files)      ← auth · google-auth · problems · notes
        │                              dashboard · analytics · sheets · profile
        │                              code · ai · platforms · leaderboard
        │                              community · news · settings · canvas
        ├── services/               ← email.ts, platforms.ts (scrapers)
        ├── utils/badges.ts         ← Badge checker + XP calculator
        └── seed.ts                 ← 50+ problems + 6 DSA sheets + demo user

```

```
# 1. Install MongoDB & Redis (if not already)
# Mac:
brew install mongodb-community redis
brew services start mongodb-community
brew services start redis

# Ubuntu/Debian:
sudo apt install mongodb-org redis-server -y
sudo systemctl start mongod redis-server

# 3. Setup Backend
cd MindMesh/backend
npm install
cp .env.example .env
# Edit .env — set these minimum required values:
#   MONGODB_URI=mongodb://localhost:27017/mindmesh
#   JWT_SECRET=any-random-long-string
#   ANTHROPIC_API_KEY=sk-ant-...   (for AI features)
#   SMTP_USER + SMTP_PASS          (for email OTP)
npm run db:seed
npm run dev   # runs on http://localhost:5000

# 4. Setup Frontend (new terminal)
cd MindMesh/frontend
npm install
cp .env.example .env.local
# Edit .env.local — set:
#   NEXTAUTH_SECRET=any-random-string
#   GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET  (for Google login)
#   BACKEND_URL=http://localhost:5000
npm run dev   # runs on http://localhost:3000

```

```
# 1. Install Docker Desktop (if not already)
# https://www.docker.com/products/docker-desktop

# 2. Run the entire stack with Docker Compose
cd MindMesh
docker-compose up --build
# This will start 4 containers:
#   - mongo (DB)
#   - redis (for caching + real-time features)
#   - backend (Node.js server on port 5000)
#   - frontend (Next.js app on port 3000)
# Access the app at http://localhost:3000
```

```
cp backend/.env.example backend/.env     # Add ANTHROPIC_API_KEY + others
cp frontend/.env.example frontend/.env.local
docker-compose up -d
docker exec mindmesh-backend npm run db:seed
```