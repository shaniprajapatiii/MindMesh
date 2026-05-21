# MindMesh — AI-Powered DSA Learning Platform

Track LeetCode, Codeforces, CodeChef, GFG with AI Mentor, Canvas Visualizer, Code Editor & more.

## Quick Start (Docker)
```bash
cp backend/.env.example backend/.env       # Add ANTHROPIC_API_KEY + others
cp frontend/.env.example frontend/.env.local
docker-compose up -d
docker exec mindmesh-backend npm run db:seed
# Open http://localhost:3000
# Demo: demo@mindmesh.dev / demo123456
```

## Manual Setup
```bash
npm run install:all   # installs root + frontend + backend
# Edit backend/.env with MONGODB_URI, secrets, API keys
npm run db:seed
npm run dev           # starts both servers
```

## Required API Keys
- ANTHROPIC_API_KEY  → console.anthropic.com (AI features)
- GOOGLE_CLIENT_ID   → console.cloud.google.com (Google login)
- SMTP_USER/PASS     → Gmail App Password (email OTP)
- JUDGE0_API_KEY     → rapidapi.com/judge0 (code execution)

## Project Structure
```
MindMesh/
├── frontend/          Next.js 14 + TypeScript + Tailwind
├── backend/           Node.js + Express + Mongoose + MongoDB
├── docker-compose.yml MongoDB + Redis + Services
└── package.json       Monorepo scripts
```

## All Pages
/ landing | /auth/login | /auth/register | /dashboard | /problems | /problems/:id
/editor | /canvas | /notes | /sheets | /roadmap | /analytics | /leaderboard
/community | /news | /profile | /settings | /ai-mentor | /u/:username

## Tech Stack
Frontend: Next.js 14, Tailwind CSS, Framer Motion, Monaco Editor, Recharts, Konva, Zustand
Backend: Express, Mongoose, MongoDB, Redis, Socket.io, Anthropic Claude, node-cron
