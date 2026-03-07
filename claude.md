# AI Study Planner SaaS — Full Project Plan (TypeScript MERN)

## 🎉 Implementation Status (Updated: February 2026)

### ✅ Completed Features

- **Authentication System**: JWT-based auth with signup/login/logout
- **Subject Management**: Full CRUD with chapters and topics
- **AI Book Import**: Gemini-powered textbook structure extraction
- **Smart Scheduling**: AI-powered schedule generation with availability consideration
- **Task Tracking**: Complete/skip tasks with optimistic UI updates
- **Progress Dashboard**: Statistics, streaks, and completion tracking
- **Availability Management**: Weekly time slot configuration
- **Performance Optimizations**: Lazy loading, memoization, DB aggregation, compression
- **API Load Balancing**: Round-robin distribution across multiple Gemini API keys

### 🚀 Recent Enhancements

- **Frontend Performance**: 50% reduction in particle count, lazy loading all pages, memoized components
- **Backend Performance**: Consolidated 4 DB queries into 1 aggregation pipeline, added indexes
- **API Optimization**: Gzip compression, load balancing between multiple API keys
- **UX Improvements**: Optimistic updates, silent background refreshes, context-aware notifications

---

## 1) Product Overview

AI Study Planner is a SaaS that generates a daily study schedule from:

- Exam deadlines
- Subject difficulty
- Remaining workload
- User availability

It auto-reschedules missed tasks and tracks progress so the user always knows **what to study today**.

**Core promise:** Stop deciding what to study. The system plans it for you.

---

## 2) Tech Stack (Final)

### Frontend

- React + TypeScript
- Tailwind CSS
- Axios
- React Router (or if you prefer, Next.js later — but this plan assumes React SPA)

### Backend

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication

### Tooling

- ESLint + Prettier
- Zod (recommended) for request validation + shared types

---

## 3) MVP Scope (Build This First)

### ✅ V1 Features

1. **Authentication**
   - Signup / Login / Logout
   - JWT access token (and optional refresh token)
   - Profile settings: weekday & weekend available minutes

2. **Subjects + Exams + Workload**
   - Create subject: name + difficulty (1–5)
   - Add exam date per subject
   - Workload definition per subject:
     - totalUnits (topics count) OR totalMinutes (hours-based)

3. **Plan Generation ("AI")**
   - Generate daily plan from today → nearest exam horizon
   - Allocate study minutes per day based on priority scoring

4. **Today Page**
   - Daily checklist of tasks
   - Mark as completed / skipped
   - Auto-reschedule missed work

5. **Progress Dashboard**
   - Completion %
   - Remaining workload
   - “At risk” subjects (behind schedule)

---

## 4) Product Rules (What Makes It Feel Smart)

### Inputs

- User availability (weekday/weekend minutes)
- Exam dates
- Difficulty
- Remaining workload

### Outputs

- A plan per day (date → list of study blocks)
- Each block: subject + minutes + optional unit range

### Core rules

- Closer exam ⇒ higher priority
- Harder subject ⇒ gets more time
- Remaining workload ⇒ boosts priority
- Do not exceed user daily capacity
- Minimum block size (e.g. 25 minutes)
- Missed blocks get pushed forward automatically

---

## 5) Scheduling Algorithm (MVP Version)

### 5.1 Scoring Formula

For each subject on each planning day:

- `daysLeft = max(1, differenceInDays(examDate, currentDate))`
- `urgencyWeight = 1 / daysLeft`
- `difficultyWeight = difficulty / 5`
- `remainingWeight = remainingWork / totalWork`

**Final score (tunable weights):**

### 5.2 Allocation

- `dailyBudgetMinutes` comes from availability:
  - weekdayMinutes if Mon–Fri
  - weekendMinutes if Sat/Sun
- Distribute `dailyBudgetMinutes` across subjects proportionally to `finalScore`
- Enforce:
  - minimum block minutes: 25
  - maximum minutes per subject per day (optional): e.g. 70% of daily budget

### 5.3 Rescheduling

When user skips tasks:

- Add skipped minutes/units back to remaining workload
- Next plan generation automatically prioritizes them (remainingWeight increases)
- Optional: apply a penalty multiplier to missed subjects for 1–2 days

---

## 6) Data Model (MongoDB + Mongoose, TypeScript)

### 6.1 Collections Overview

- `users`
- `subjects`
- `exams`
- `workloads`
- `plans`
- `studyLogs`

### 6.2 TypeScript Interfaces (Conceptual)

> Note: you’ll define these as Mongoose schemas + TS types.

#### User

- `_id`
- `email`
- `passwordHash`
- `availability: { weekdayMinutes: number; weekendMinutes: number }`
- `createdAt`, `updatedAt`

#### Subject

- `_id`
- `userId`
- `name`
- `difficulty: 1 | 2 | 3 | 4 | 5`
- `createdAt`, `updatedAt`

#### Exam

- `_id`
- `subjectId`
- `examDate` (ISO string or Date)
- `createdAt`, `updatedAt`

#### Workload

- `_id`
- `subjectId`
- `mode: "units" | "minutes"`
- `totalUnits?`
- `completedUnits?`
- `totalMinutes?`
- `completedMinutes?`
- `createdAt`, `updatedAt`

#### Plan (Generated Schedule)

- `_id`
- `userId`
- `date` (YYYY-MM-DD string)
- `items: PlanItem[]`
- `status: "planned" | "adjusted"`
- `createdAt`, `updatedAt`

PlanItem

- `subjectId`
- `minutes`
- `unitFrom?`
- `unitTo?`

#### StudyLog (What actually happened)

- `_id`
- `userId`
- `date` (YYYY-MM-DD)
- `completedItems: LogItem[]`
- `skippedItems: LogItem[]`
- `createdAt`, `updatedAt`

LogItem

- `subjectId`
- `minutes`
- `units?`

---

## 7) API Design (Express + TypeScript)

### 7.1 Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout` (optional)
- `GET  /api/auth/me`

### 7.2 Subjects / Exams / Workloads

- `GET  /api/subjects`
- `POST /api/subjects`
- `PATCH /api/subjects/:id`
- `DELETE /api/subjects/:id`

- `POST /api/subjects/:id/exam` (create/update exam date)
- `GET  /api/subjects/:id/exam`

- `POST /api/subjects/:id/workload` (set workload)
- `GET  /api/subjects/:id/workload`

### 7.3 Planning

- `POST /api/plans/generate`
  - body: `{ fromDate?: string; days?: number }`
- `GET  /api/plans/today`
- `GET  /api/plans?from=YYYY-MM-DD&to=YYYY-MM-DD`

### 7.4 Logs (completion)

- `POST /api/logs/today/complete`
- `POST /api/logs/today/skip`
- `GET  /api/logs?from=YYYY-MM-DD&to=YYYY-MM-DD`

### 7.5 Dashboard

- `GET /api/dashboard/summary`
  - returns: completion %, remaining per subject, at-risk list

---

## 8) Shared Types (Frontend + Backend)

To keep things consistent:

- Create a `/shared` folder (or a separate package) containing:
  - request/response types
  - enums (difficulty, workload mode, plan status)
- Validation:
  - Use **Zod** schemas in backend, and infer TS types from schemas
  - Optionally reuse Zod schemas on frontend for form validation

---

## 9) Frontend Pages (React + TS + Tailwind)

### Public

- `/login`
- `/signup`

### App

- `/dashboard`
  - progress summary
  - at-risk subjects
  - upcoming exams

- `/today`
  - today’s plan items
  - complete/skip actions
  - quick reschedule indicator

- `/subjects`
  - list subjects
  - add/edit subject (difficulty + exam date + workload)

- `/settings`
  - weekday/weekend minutes
  - timezone (optional)

---

## 10) UI/UX Requirements (Responsive by default)

### Tailwind approach

- Use mobile-first layout:
  - Single column on mobile
  - Two-column on desktop for dashboard
- Components:
  - Card layout for plan items
  - Sticky header on mobile for quick navigation
- Accessibility:
  - Button sizes (min height 44px)
  - Proper focus styles
  - Keyboard navigable forms

---

## 11) Project Structure (Recommended)

### Backend (Express + TS)

---

## 12) Security Basics (MVP)

- Hash passwords (bcrypt)
- Store JWT securely:
  - Recommended: HttpOnly cookies (more secure)
  - Alternative: localStorage (faster to implement but less secure)
- Rate limit auth endpoints
- Validate all inputs (Zod)
- CORS configured properly
- Do not log sensitive info

---

## 13) Monetization (Later)

### Free

- 2 subjects
- Basic plan generation

### Pro

- Unlimited subjects
- Advanced rescheduling
- Analytics history (30/90/365 days)
- Revision mode (last 7 days strategy)

---

## 14) Development Sprints (Practical Order)

### Sprint 1 — Foundations

- Repo setup (client/server)
- Tailwind + routing
- Express TS setup + Mongo connection
- User model + auth endpoints

### Sprint 2 — Subjects / Exams / Workloads

- CRUD subjects
- Exam + workload endpoints
- Frontend forms + list pages

### Sprint 3 — Plan Engine

- Implement scoring + allocation service
- Generate plan endpoint
- Today plan endpoint
- Today page UI

### Sprint 4 — Logs + Reschedule + Dashboard

- Complete/skip logging
- Reschedule behavior (via regeneration or adjustments)
- Dashboard summary endpoint + UI

### Sprint 5 — Polish

- Better mobile UX
- Loading states + errors
- Empty states
- Basic analytics charts

---

## 15) Definition of Done (MVP)

A user can:

- Create an account
- Add subjects, exams, and workload
- Generate a study plan
- See tasks for today
- Mark tasks as complete/skip
- See progress and what’s at risk

---

## 16) Future Enhancements

- Pomodoro timer + study sessions
- Topic-level planning (syllabus breakdown)
- Smart revision mode
- Notifications (email/push)
- Study groups / shared plans
- Import calendar deadlines

---

## 17) Notes on “AI” Branding

For MVP, you can honestly call it “AI-powered” because:

- It uses a weighted decision system
- It adapts to missed tasks (dynamic scheduling)
- It produces personalized plans from user behavior + constraints

When ready, you can add:

- LLM-powered explanations (“Why this plan today?”)
- ML-based prediction of completion likelihood
