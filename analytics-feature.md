# Progress Analytics & Trends Feature

## Goal

Build comprehensive analytics dashboard showing completion trends, subject performance, and exam completion predictions (last 30 days, hourly granularity).

---

## Tasks

### BACKEND (Data Layer)

- [ ] **Task 1: Create analytics aggregation pipeline**
  - File: `backend/src/services/analytics.service.ts` (NEW)
  - Add function: `getMonthlyAnalytics(userId, startDate)`
  - Returns: `{ dailyCompletion: [{date, rate, taskCount}], subjectPerformance: [{subjectName, completionRate, totalMinutes}]}`
  - Verify: Run in MongoDB shell, check aggregation returns last 30 days grouped by day
  - **Dependency:** Must read Schedule model first

- [ ] **Task 2: Create hourly time analysis**
  - File: `backend/src/services/analytics.service.ts`
  - Add function: `getProductivityByHour(userId)`
  - Returns: 24-hour array with completion rates per hour: `[{hour: 0-23, completionRate, taskCount}]`
  - Extract hour from `completedAt` timestamp in Schedule
  - Verify: Test with sample data, check hour distribution makes sense

- [ ] **Task 3: Create exam completion prediction**
  - File: `backend/src/services/analytics.service.ts`
  - Add function: `getPredictedCompletionDate(userId, subjectId)`
  - Logic: `(totalWorkload - completedWorkload) / avgCompletionRatePerDay`
  - Returns: `{subjectId, examDate, currentPace: 'on-track' | 'at-risk' | 'ahead', predictedDate, daysUntilDeadline}`
  - Verify: Create test subject with exam date, log current pace calculation

- [ ] **Task 4: Create analytics controller**
  - File: `backend/src/controllers/analytics.controller.ts` (NEW)
  - Endpoints:
    - `GET /api/analytics/summary` → calls all 3 service functions
    - Returns: `{monthly, hourly, predictions}`
  - Add error handling for missing data (empty history)
  - Verify: curl endpoints, check JSON structure

- [ ] **Task 5: Create analytics routes**
  - File: `backend/src/routes/analytics.route.ts` (NEW)
  - Register in `index.ts`
  - Add middleware: `AuthMiddleware` (users must be logged in)
  - Verify: Run backend, navigate to `/api/analytics/summary`, see 200 response

---

### FRONTEND (UI Layer)

- [ ] **Task 6: Create Analytics page structure**
  - File: `frontend/src/pages/Analytics.tsx` (NEW)
  - Layout: Grid with 4 sections (completion chart, subject heatmap, prediction cards, hourly heatmap)
  - Import from api: `import * as analyticsApi from '../api/analytics'` (NEW FILE)
  - Add loading state + error boundary
  - Verify: Page renders without errors (use mock data if backend not ready)

- [ ] **Task 7: Create analytics API client**
  - File: `frontend/src/api/analytics.ts` (NEW)
  - Function: `fetchAnalyticsSummary()` → calls `GET /api/analytics/summary`
  - Returns typed response matching backend schema
  - Add error logging
  - Verify: Call in browser console, see data structure

- [ ] **Task 8: Add monthly completion rate chart**
  - File: `frontend/src/components/dashboard/AnalyticsCompletionChart.tsx` (NEW)
  - Use Recharts: `LineChart` + `Area` + tooltip
  - X-axis: date, Y-axis: completion % (0-100)
  - Show last 30 days
  - Add trend line (avg completion rate)
  - Verify: `npm run dev`, see line chart with data points

- [ ] **Task 9: Add subject performance heatmap**
  - File: `frontend/src/components/dashboard/SubjectHeatmap.tsx` (NEW)
  - Grid layout: subjects × 4 weeks
  - Color: green (100% complete) → red (0% complete)
  - Hover tooltip: "Math: 78% (15/19 tasks completed)"
  - Verify: Visual inspection, all subjects showing correct %

- [ ] **Task 10: Add exam completion prediction**
  - File: `frontend/src/components/dashboard/PredictionCards.tsx` (NEW)
  - Card per subject with exam date + current pace indicator
  - Text: "At current pace, you'll finish Math by March 18 (3 days early) ✅"
  - Or: "⚠️ At risk - exam in 5 days, predicted finish: April 2"
  - Color: green (ahead), yellow (on-track), red (at-risk)
  - Verify: Manual test with different scenarios

- [ ] **Task 11: Add hourly productivity heatmap**
  - File: `frontend/src/components/dashboard/HourlyHeatmap.tsx` (NEW)
  - 24-hour bar chart or heatmap
  - X-axis: 0-23 hours, Y-axis: completion rate %
  - Highlight peak productivity hour
  - Verify: See hourly distribution matches test data

- [ ] **Task 12: Add Analytics page route**
  - File: `frontend/src/App.tsx`
  - Add route: `<Route path="/analytics" element={<Analytics />} />`
  - Add nav link in `DashboardLayout.tsx`
  - Verify: Click from navbar, page loads without errors

---

### VERIFICATION (Testing)

- [ ] **Full flow test:**
  - Complete 5+ tasks over 3+ days
  - Navigate to `/analytics`
  - Verify: Completion chart shows data, heatmaps render, prediction cards display exam status
  - Check: No console errors, data matches UI expectations

- [ ] **Edge cases:**
  - No data (new user): page should show "No data available"
  - Exam already passed: prediction should show "Exam passed"
  - 100% completion: all visuals should max out to green

---

## Done When

- [ ] All 4 analytics endpoints responding correctly
- [ ] All 5 frontend components rendering with real data
- [ ] Analytics page accessible from navbar
- [ ] No console errors on analytics page
- [ ] Predictions match manual calculations (spot check 2 subjects)

---

## Notes

- **Data dependency:** Relies on accurate `completedAt` timestamps in Schedule model. Verify these are being saved correctly.
- **Performance:** Last 30 days aggregation should be <500ms (add IndexedDB caching if slower).
- **Future:** Can extend to all-time analytics by allowing date range picker in UI.
- **Phase 2 ideas:** Add exports (PDF report), add filters (by subject/date range).
