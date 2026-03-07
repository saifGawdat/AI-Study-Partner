# Study Partner

AI-powered study planner that generates daily schedules from your subjects, availability, and deadlines. Built with the MERN stack and TypeScript.

## Quick Start

**Prerequisites:** Node.js 18+, MongoDB, Gemini API key(s).

```bash
# Clone and enter project
git clone <repository-url>
cd Study-Partner

# Backend
cd backend && npm install
# Create backend/.env (see Configuration below)
npm run dev

# Frontend (new terminal)
cd frontend && npm install
# Create frontend/.env (see Configuration below)
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:5000  

## Features

- **Authentication** — Email/password signup and login, **Google Sign-In**, JWT in HTTP-only cookies, refresh tokens
- **Subjects** — Create subjects with chapters and topics; optional exam dates and workload
- **AI book import** — Upload PDF or images; Gemini extracts textbook structure (chapters/topics)
- **Smart scheduling** — Generate a study schedule from your availability and subject workload; AI balances sessions (e.g. 30–90 min)
- **Today & tracking** — View today’s tasks, mark complete/skip, optimistic UI, auto-reschedule
- **Dashboard** — Progress, streaks, statistics
- **Availability** — Set weekly time slots; schedule respects your capacity
- **Performance** — Lazy-loaded pages, memoized components, gzip, round-robin Gemini API keys

## Configuration

### Backend (`.env` in `backend/`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `JWT_SECRET` | Secret for signing JWTs |
| `MONGO_URI` | MongoDB connection string |
| `FRONTEND_URL` | Allowed CORS origin (e.g. `http://localhost:5173`) |
| `NODE_ENV` | `development` or `production` |
| `GEMINI_API_KEY` | Primary Gemini API key |
| `GEMINI_API_KEY1` | Optional second key (load balanced) |
| `GOOGLE_CLIENT_ID` | Google OAuth Web client ID (for Google Sign-In) |

### Frontend (`.env` in `frontend/`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base (e.g. `http://localhost:5000/api`) |
| `VITE_GOOGLE_CLIENT_ID` | Same Google OAuth Web client ID (for Sign-In button) |
| `VITE_GEMINI_API_KEY` | (Optional) Gemini key if used on client |
| `VITE_GEMINI_API_KEY1` | (Optional) Second key if used on client |

**Google Sign-In:** Create an OAuth 2.0 Web client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add your frontend origin to authorized JavaScript origins, and set both `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend). If either is missing, the Google button is hidden.

## Usage

1. **Sign up or log in** (email or Google).
2. **Add subjects** — Create subjects and optionally add chapters/topics or use AI book import.
3. **Set availability** — Configure when you can study each week.
4. **Generate schedule** — Use AI to build a schedule; view and complete tasks on the Today page.
5. **Track progress** — Use the dashboard for stats and streaks.

## API Reference

### Authentication (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Create account |
| POST | `/login` | Login with email/password |
| POST | `/google` | Login with Google ID token (`credential`) |
| POST | `/refresh` | Refresh access token (cookie) |
| POST | `/logout` | Logout (requires auth) |
| GET | `/me` | Current user (requires auth) |
| DELETE | `/` | Delete account (requires auth) |

### Subjects (`/api/subjects`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List subjects |
| GET | `/stats` | Subject statistics |
| GET | `/:id` | Get subject by ID |
| POST | `/` | Create subject |
| PUT | `/:id` | Update subject |
| DELETE | `/:id` | Delete subject |

### Schedule (`/api/schedule`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List schedules |
| POST | `/` | Create schedule item |
| PUT | `/:id` | Update schedule item |
| DELETE | `/:id` | Delete schedule item |
| GET | `/stats` | Study statistics |
| POST | `/generate` | Generate AI schedule |

### Availability (`/api/availability`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Get all availability |
| GET | `/:day` | Get availability for day |
| POST | `/` | Set availability |
| DELETE | `/:day` | Delete availability for day |
| GET | `/stats/weekly-hours` | Weekly hours summary |

### AI (`/api/ai`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/extract-book` | Extract book structure (multipart, field `file`) |

### Gamification (`/api/gamification`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/milestones` | Get milestones (requires auth) |

## Project Structure

```
Study-Partner/
├── backend/
│   ├── src/
│   │   ├── config/         # DB and app config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, errors
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # UI components
│   │   ├── hooks/          # e.g. useAuth
│   │   ├── layouts/        # AuthLayout, etc.
│   │   ├── pages/          # Login, Dashboard, etc.
│   │   └── App.tsx
│   └── package.json
├── CLAUDE.md               # Project plan and spec
└── README.md
```

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Axios, GSAP, Three.js / React Three Fiber, @react-oauth/google |
| Backend | Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Zod, google-auth-library, @google/generative-ai, compression, cookie-parser |

## Security

- Passwords hashed with bcrypt; optional Google-only accounts (no password).
- JWT in HTTP-only cookies; refresh token rotation.
- Input validation with Zod; CORS and rate limiting on auth.

## Documentation

- [CLAUDE.md](./CLAUDE.md) — Product overview, data model, scheduling rules, and implementation status.

## Contributing

Contributions are welcome. Open an issue or submit a pull request.

## License

MIT.

---

**Built with TypeScript, React, and Node.js**
