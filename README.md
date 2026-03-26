# Split & Steal

A full-stack Prisoner's Dilemma game where a player competes against an adaptive AI opponent.

This repository contains only:

```text
Split & Steal/
  backend/
  frontend/
  README.md
```

## Table of Contents

1. Project Overview
2. Tech Stack
3. Architecture
4. Game Flow
5. Local Setup (Step-by-Step)
6. Environment Variables
7. Running the App
8. API Reference
9. Deployment (Render + Vercel)
10. Production Checklist
11. Troubleshooting
12. Maintenance Notes

---

## 1) Project Overview

Split & Steal is a session-based strategy game:
- You and AI choose `SPLIT` or `STEAL` each round.
- Outcomes adjust scores and trust.
- You can negotiate with AI before deciding.
- Powerups affect round economics and behavior.
- Sessions are in-memory (no database, no login).

Key design goals:
- Fast to run and deploy.
- Clear frontend/backend separation.
- Easy to swap dummy behavior with stricter production logic later.

---

## 2) Tech Stack

### Frontend
- React 18
- Vite 5
- Tailwind CSS v4

### Backend
- Node.js 20+
- Express 4
- CORS + dotenv
- Gemini API integration for negotiation responses

---

## 3) Architecture

### High-level
- `frontend` (Vercel) calls REST endpoints on `backend` (Render).
- `backend` stores game sessions in memory using a session store class.
- AI response text in negotiation can come from Gemini; fallback logic still keeps gameplay functional if Gemini fails.

### Important behavior decisions
- Final AI action is **probabilistic**, not deterministic.
- Trust and chat influence probabilities, but never guarantee an outcome.
- Currency and game economy use dollars (`$`) consistently.

---

## 4) Game Flow

1. Start game (name, rounds, pot)
2. Powerup selection
3. Negotiation + action decision
4. Round result
5. Next round or final summary
6. Reboot returns to start/registration page

Session state transitions:
- `start -> powerup -> round -> result -> powerup ... -> summary`

---

## 5) Local Setup (Step-by-Step)

## Prerequisites
- Node.js `20+`
- npm `10+`

## Clone and enter repo

```bash
git clone <your-repo-url>
cd "Split & Steal"
```

## Backend setup

```bash
cd backend
cp .env.example .env
npm install
```

Edit `backend/.env` and set your Gemini key:

```env
GEMINI_API_KEY=your_real_key_here
```

## Frontend setup

```bash
cd ../frontend
cp .env.example .env
npm install
```

---

## 6) Environment Variables

## Backend (`backend/.env`)

```env
PORT=8787
FRONTEND_ORIGIN=http://localhost:5173,https://YOUR-FRONTEND.vercel.app
ALLOW_VERCEL_PREVIEW_ORIGINS=false
SESSION_TTL_MINUTES=60
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite-preview
GEMINI_TIMEOUT_MS=15000
```

Meaning:
- `PORT`: backend port.
- `FRONTEND_ORIGIN`: comma-separated exact origins allowed by CORS.
- `ALLOW_VERCEL_PREVIEW_ORIGINS`: set `true` only if you want wildcard `*.vercel.app` preview domains.
- `SESSION_TTL_MINUTES`: in-memory session expiry.
- `GEMINI_*`: AI negotiation settings.

## Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8787
```

Meaning:
- Base URL for all frontend API calls.

---

## 7) Running the App

Run backend:

```bash
cd backend
npm run dev
```

Run frontend (new terminal):

```bash
cd frontend
npm run dev
```

Open:
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8787/health`

Production build check:

```bash
cd frontend
npm run build
```

Run backend in production mode:

```bash
cd backend
npm start
```

---

## 8) API Reference

Base path: `/api/game`

### `POST /start`
Create a new game session.

Request body:

```json
{
  "playerName": "YOU",
  "rounds": 5,
  "pot": 100000
}
```

Response:
- `201` with `{ sessionId, state }`

### `GET /:sessionId/state`
Fetch current session state.

### `POST /:sessionId/powerup`
Apply selected powerup.

Body:

```json
{ "powerupKey": "insurance" }
```

### `POST /:sessionId/negotiate`
Send player message to negotiation channel.

Body:

```json
{ "message": "Let's split and both win." }
```

### `POST /:sessionId/action`
Submit `SPLIT` or `STEAL`.

Body:

```json
{ "action": "SPLIT" }
```

### `POST /:sessionId/next-round`
Advance to next round or summary.

### `GET /health`
Service health and Gemini availability.

---

## 9) Deployment (Render + Vercel)

Recommended:
- Backend -> Render
- Frontend -> Vercel

## Deploy backend to Render

1. Create Web Service from your GitHub repo.
2. Set Root Directory to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env vars from Section 6.
6. Deploy.
7. Verify `https://<render-url>/health`.

## Deploy frontend to Vercel

1. Create project from same repo.
2. Set Root Directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_API_BASE_URL=https://<render-url>`.
6. Deploy.

## Final CORS sync

After frontend deploy, set backend:

```env
FRONTEND_ORIGIN=https://<your-vercel-domain>
```

If you also use preview links, either:
- Add each preview domain explicitly, or
- Set `ALLOW_VERCEL_PREVIEW_ORIGINS=true`.

Redeploy backend after CORS changes.

---

## 10) Production Checklist

- `frontend/.env` points to deployed backend URL.
- `backend` has valid `GEMINI_API_KEY`.
- CORS origin exactly matches deployed frontend domain.
- Health endpoint is reachable.
- Frontend build succeeds.
- Session TTL is appropriate for gameplay.
- No `.env` files committed.

---

## 11) Troubleshooting

## CORS blocked
- Symptom: browser API errors + 403 or CORS failure.
- Fix: set `FRONTEND_ORIGIN` exactly to deployed frontend origin and redeploy backend.

## Gemini timeout / 429
- Cause: quota/rate limits or slow response.
- Fix:
  - reduce request frequency,
  - upgrade plan / verify billing,
  - tune `GEMINI_TIMEOUT_MS`,
  - keep fallback behavior enabled (already implemented).

## Frontend builds but API fails
- Verify `VITE_API_BASE_URL`.
- Verify backend `/health` reachable publicly.

## Game state resets unexpectedly
- Expected if backend restarts (in-memory store).
- For persistence, move sessions to Redis/Postgres in a future version.

---

## 12) Maintenance Notes

- Session data is ephemeral by design.
- API is intentionally minimal and easy to evolve.
- If you add auth/db later, start by abstracting session storage from `SessionStore`.

---

If you want, next step can be adding CI (GitHub Actions) for:
- `npm run build` in `frontend`
- backend `node --check` validation
on every push.
