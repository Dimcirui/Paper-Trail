# UI Design Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the two co-existing design systems (slate vs zinc/gray) and fix the five biggest structural AI-flavor tells to produce a visually consistent, professional UI.

**Architecture:** All changes are purely cosmetic Tailwind class replacements and minor JSX restructuring. No new components, no backend changes, no new dependencies. The `manage/page.tsx` is the most involved change because it currently bypasses `DashboardLayout` entirely with its own full-page wrapper.

**Tech Stack:** Next.js 14, Tailwind CSS v4, React — no new packages needed.

---

## File Map

| File | Change |
|---|---|
| `papertrail-app/src/app/login/components/LoginForm.tsx` | Replace `zinc`/`gray` → `slate`; fix `shadow-2xl` → `shadow-sm` |
| `papertrail-app/src/app/dashboard/manage/page.tsx` | Remove own layout wrapper; replace `zinc` → `slate`; standardize card radius to `rounded-2xl` |
| `papertrail-app/src/app/dashboard/analytics/charts.tsx` | Change card `rounded-3xl` → `rounded-2xl`; add section grouping dividers |
| `papertrail-app/src/app/dashboard/page.tsx` | Add icons to the three KPI stat cards |
| `papertrail-app/src/app/page.tsx` | Improve landing page with brief value proposition and feature grid |

---

## Task 1: Unify LoginForm color system

**Files:**
- Modify: `papertrail-app/src/app/login/components/LoginForm.tsx`

**Problem:** Uses `bg-zinc-50`, `text-gray-700`, `border-gray-300`, `shadow-2xl` — none of which exist in the rest of the app.

- [ ] **Step 1: Replace zinc/gray with slate in the outer wrapper**

  In `LoginForm.tsx`, change line 59:
  ```tsx
  // Before
  <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
  // After
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
  ```

- [ ] **Step 2: Fix the card shadow and title color**

  Change line 60–61:
  ```tsx
  // Before
  <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
    <h2 className="text-3xl font-bold text-center text-indigo-700">PaperTrail Login</h2>
  // After
  <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
    <h2 className="text-2xl font-semibold text-center text-slate-900">PaperTrail</h2>
  ```

- [ ] **Step 3: Replace all gray label/input classes**

  Replace every `text-gray-700` with `text-slate-700`, every `border-gray-300` with `border-slate-200`, and update input focus ring:
  ```tsx
  // label (line 72, 84)
  className="block text-sm font-medium text-slate-700 mb-1"
  // input (line 73–79, 85–91)
  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  ```

- [ ] **Step 4: Verify visually**

  Start dev server: `cd papertrail-app && npm run dev`
  Navigate to `http://localhost:3000/login`.
  Expected: Login card matches the same look as dashboard cards (white bg, thin border, subtle shadow, slate text).

- [ ] **Step 5: Commit**

  ```bash
  git add papertrail-app/src/app/login/components/LoginForm.tsx
  git commit -m "style: unify login page colors to slate system"
  ```

---

## Task 2: Fix manage/page.tsx layout and color system

**Files:**
- Modify: `papertrail-app/src/app/dashboard/manage/page.tsx`

**Problem:** This page defines its own `min-h-screen bg-zinc-50 p-8 font-sans` wrapper and has its own header with logout button + nav links, completely ignoring `DashboardLayout`. It also uses `max-w-7xl` while layout uses `max-w-6xl`, and uses `zinc-*` colors throughout.

- [ ] **Step 1: Remove the own-layout wrapper and inner header**

  The `return (...)` in `ManagePage` currently wraps everything in `<div className="min-h-screen bg-zinc-50 p-8 font-sans">` and contains a `<div className="max-w-7xl mx-auto mb-8 ...">` header with its own nav links and `LogoutButton`.

  Replace the entire outer `<div>` with just the page content (no wrapper, no custom header) since `DashboardLayout` already handles all of that:
  ```tsx
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Manage Papers</h2>
          <p className="text-sm text-slate-500">Edit, delete, or create manuscripts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manage/trash"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span>🗑️</span>
            <span>Trash</span>
          </Link>
          <Link
            href="/dashboard/manage/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Paper
          </Link>
        </div>
      </div>
      {/* rest of content unchanged */}
    </div>
  );
  ```

- [ ] **Step 2: Remove unused imports**

  Remove the `LogoutButton` import (line 3) since the manage page no longer renders it:
  ```tsx
  // Delete this line:
  import LogoutButton from '../components/LogoutButton';
  ```

- [ ] **Step 3: Replace zinc colors in the empty state and cards**

  In the empty state div (line 74):
  ```tsx
  // Before
  <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-xl border border-dashed border-zinc-300">
    ...
    <h3 className="text-lg font-medium text-zinc-900">No papers yet</h3>
    <p className="mt-1 text-sm text-zinc-500">Get started by creating a new research paper.</p>
  // After
  <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
    ...
    <h3 className="text-lg font-medium text-slate-900">No papers yet</h3>
    <p className="mt-1 text-sm text-slate-500">Get started by creating a new research paper.</p>
  ```

  In each paper card (line 92–93):
  ```tsx
  // Before
  className="group bg-white p-6 rounded-xl shadow-sm border border-zinc-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col h-full"
  // After
  className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col h-full"
  ```

  Paper title (line 102):
  ```tsx
  // Before
  className="text-lg font-semibold text-zinc-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2"
  // After
  className="text-lg font-semibold text-slate-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2"
  ```

  Abstract text (line 105):
  ```tsx
  // Before
  className="text-sm text-zinc-500 line-clamp-3"
  // After
  className="text-sm text-slate-500 line-clamp-3"
  ```

  Card footer border + metadata (lines 111–121):
  ```tsx
  // Before
  className="pt-4 border-t border-zinc-100 mt-auto"
  ...
  className="flex flex-col gap-1 mb-4 text-xs text-zinc-500"
  // After
  className="pt-4 border-t border-slate-100 mt-auto"
  ...
  className="flex flex-col gap-1 mb-4 text-xs text-slate-500"
  ```

  Paper ID badge (line 97):
  ```tsx
  // Before
  className="text-xs font-mono text-zinc-400"
  // After
  className="text-xs font-mono text-slate-400"
  ```

  Edit button (line 126):
  ```tsx
  // Before
  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 rounded-md hover:bg-zinc-200 transition-colors"
  // After
  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
  ```

- [ ] **Step 4: Update StatusBadge (lines 143–158) to use slate instead of zinc**

  ```tsx
  const styles: Record<string, string> = {
    Draft: "bg-slate-100 text-slate-600",
    Submitted: "bg-sky-50 text-sky-700",
    UnderReview: "bg-indigo-50 text-indigo-600",
    Accepted: "bg-emerald-50 text-emerald-700",
    Published: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    Rejected: "bg-rose-50 text-rose-600 border border-rose-100",
    Withdrawn: "bg-slate-50 text-slate-500 border border-slate-200",
  };
  ```
  This also aligns the badge styles with `statusClasses` in `dashboard/page.tsx`.

- [ ] **Step 5: Verify visually**

  Navigate to `http://localhost:3000/dashboard/manage`.
  Expected: Page now uses the shared dashboard header/nav from `DashboardLayout`. No duplicate logout button. Cards use slate colors.

- [ ] **Step 6: Commit**

  ```bash
  git add papertrail-app/src/app/dashboard/manage/page.tsx
  git commit -m "style: migrate manage page to shared DashboardLayout and slate colors"
  ```

---

## Task 3: Standardize analytics card border radius

**Files:**
- Modify: `papertrail-app/src/app/dashboard/analytics/charts.tsx`

**Problem:** All analytics cards use `rounded-3xl` while every other card in the app uses `rounded-2xl` or `rounded-xl`. Also: 11 charts are in a flat grid with no grouping — add section headings to create visual narrative.

- [ ] **Step 1: Replace all `rounded-3xl` with `rounded-2xl` in charts.tsx**

  There are 9 occurrences of `rounded-3xl border border-slate-200 bg-white p-8 shadow-sm`. Do a replace-all:
  ```tsx
  // Before (all 9 card wrappers)
  className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm ..."
  // After
  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ..."
  ```
  Note: also reduce padding from `p-8` → `p-6` to match other pages.

- [ ] **Step 2: Add section divider headers between chart groups**

  In the main return `<div className="grid gap-6 lg:grid-cols-2">`, insert labeled `<div>` wrappers to group charts into sections. The 11 charts fall into 5 logical groups:

  Wrap the content like this (structure only — keep existing chart JSX unchanged):
  ```tsx
  <div className="space-y-10">
    {/* Section: Workflow */}
    <section>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Workflow</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submission pipeline funnel — lg:col-span-2 */}
        {/* Papers per status pie */}
        {/* Publications per year bar */}
      </div>
    </section>

    {/* Section: Venues */}
    <section>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Venues</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top venues by submissions — lg:col-span-2 */}
        {/* Journal vs Conference doughnut */}
        {/* Papers by venue ranking bar */}
      </div>
    </section>

    {/* Section: Publication Speed */}
    <section>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Publication Speed</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Time to publication — lg:col-span-2 */}
      </div>
    </section>

    {/* Section: People */}
    <section>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">People</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top contributors — lg:col-span-2 */}
        {/* Papers by institution — lg:col-span-2 */}
      </div>
    </section>

    {/* Section: Funding & Topics */}
    <section>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Funding & Topics</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Grants — lg:col-span-2 */}
        {/* Papers by research topic — lg:col-span-2 */}
      </div>
    </section>
  </div>
  ```

- [ ] **Step 3: Verify visually**

  Navigate to `http://localhost:3000/dashboard/analytics`.
  Expected: Charts have matching corner radius to rest of app. Five section labels (Workflow, Venues, Publication Speed, People, Funding & Topics) provide visual grouping.

- [ ] **Step 4: Commit**

  ```bash
  git add papertrail-app/src/app/dashboard/analytics/charts.tsx
  git commit -m "style: standardize analytics card radius and add section grouping"
  ```

---

## Task 4: Add icons to dashboard KPI cards

**Files:**
- Modify: `papertrail-app/src/app/dashboard/page.tsx`

**Problem:** The three stat cards (lines 150–183) are bare number + label boxes with no visual anchoring. Adding a small inline SVG icon to each card makes them immediately scannable and less generic.

- [ ] **Step 1: Add icon to "Recent Manuscripts" card (lines 150–160)**

  ```tsx
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-widest text-slate-500">Recent Manuscripts</p>
      <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <p className="mt-2 text-3xl font-semibold text-slate-900">{systemTotal}</p>
    <p className="text-sm text-slate-500">Total manuscripts currently in the system.</p>
  </div>
  ```

- [ ] **Step 2: Add icon to "Editorial Throughput" card (lines 161–170)**

  ```tsx
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-widest text-slate-500">Editorial Throughput</p>
      <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </div>
    <p className="mt-2 text-3xl font-semibold text-slate-900">{activeDrafts}</p>
    <p className="text-sm text-slate-500">Drafts awaiting submission or assignment.</p>
  </div>
  ```

- [ ] **Step 3: Add icon to "Role Permissions" card (lines 171–183)**

  ```tsx
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-widest text-slate-500">Role Permissions</p>
      <svg className="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
    <p className="mt-2 text-2xl font-semibold text-slate-900 capitalize break-words">{displayRole}</p>
    <p className="text-sm text-slate-500">{editable ? "Full manuscript management enabled." : "Read-only."}</p>
  </div>
  ```

- [ ] **Step 4: Verify visually**

  Navigate to `http://localhost:3000/dashboard`.
  Expected: Each KPI card has a small muted icon in the top-right corner. Cards feel more structured and less generic.

- [ ] **Step 5: Commit**

  ```bash
  git add papertrail-app/src/app/dashboard/page.tsx
  git commit -m "style: add icons to dashboard KPI stat cards"
  ```

---

## Task 5: Improve landing page

**Files:**
- Modify: `papertrail-app/src/app/page.tsx`

**Problem:** The landing page is 31 lines of centered text and a single button. It has no product identity beyond a title.

- [ ] **Step 1: Replace with structured landing page**

  ```tsx
  import Link from "next/link";

  const features = [
    {
      title: "Unified paper feed",
      desc: "Browse every manuscript across all statuses from one table. Filter, search, and open in a click.",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 10h16M4 14h10" />
        </svg>
      ),
    },
    {
      title: "Semantic search",
      desc: "Find papers by meaning, not just keywords. Powered by pgvector and OpenAI embeddings.",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      ),
    },
    {
      title: "Analytics snapshot",
      desc: "Track submission pipelines, publication rates, venue rankings, and author productivity.",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Role-based access",
      desc: "Admin, Principal Investigator, Contributor, and Viewer roles with fine-grained permissions.",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  export default function Home() {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 px-6 py-16 text-slate-900">
        <div className="mx-auto w-full max-w-4xl">
          {/* Hero */}
          <div className="space-y-6 text-center">
            <p className="text-xs uppercase tracking-[1em] text-indigo-400">SunXHoC Research OS</p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              PaperTrail
            </h1>
            <p className="mx-auto max-w-xl text-base text-slate-500 sm:text-lg">
              Academic manuscript management for research teams. Track submissions,
              collaborators, venues, and publication timelines in one place.
            </p>
            <div className="flex items-center justify-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-10 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Enter Dashboard
              </Link>
            </div>
          </div>

          {/* Feature grid */}
          <div className="mt-20 grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 inline-flex rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify visually**

  Navigate to `http://localhost:3000`.
  Expected: Hero section with product name and tagline, followed by a 2×2 feature grid. Matches the slate/indigo color system.

- [ ] **Step 3: Commit**

  ```bash
  git add papertrail-app/src/app/page.tsx
  git commit -m "style: redesign landing page with feature grid and product tagline"
  ```

---

## Self-Review

### Spec coverage check
| Issue identified | Addressed in task |
|---|---|
| Login: zinc/gray colors, shadow-2xl | Task 1 ✓ |
| Manage: own layout wrapper, zinc colors, mismatched StatusBadge | Task 2 ✓ |
| Analytics: rounded-3xl, flat chart list | Task 3 ✓ |
| Dashboard KPI cards: bare, no icons | Task 4 ✓ |
| Landing page: placeholder | Task 5 ✓ |

### Placeholder scan
No TBD/TODO placeholders present — all steps include actual code.

### Type consistency
No new types introduced. All changes are class string replacements and JSX structure changes.
