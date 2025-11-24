# Requirements Status

## 1. CRUD & Entity Variety

- ✅ **Paper detail view and API** – `src/app/api/papers/[id]/route.ts` exposes GET/PATCH handlers backed by `sp_get_paper_overview`, and the read-only UI lives at `src/app/dashboard/browser/[id]/page.tsx`. Authors, revisions, and logs render read-only data from the stored procedure.
- ✅ **Create paper flow** – `src/app/dashboard/manage/new/page.tsx` and the reusable form component submit to `POST /api/papers` (`src/app/api/papers/route.ts`). Client-side validation includes empty-field checks and toast feedback.
- ✅ **Edit paper & authorship management** – `src/app/dashboard/manage/[id]/page.tsx` (and `manage-paper-panel.tsx`) implement PATCH for paper fields, and trigger stored procedures for adding/removing/reordering authors plus managing grants.
- ⚠️ **Grant CRUD** – grant linking exists via stored procedures, but there is no dedicated UI to list or edit grants outside the manage view. If the rubric expects a standalone grant admin screen, this remains outstanding.

## 2. Analytics & Reporting

- ⚠️ **Analytics API** – The dashboard (`src/app/dashboard/analytics/page.tsx`) issues Prisma queries directly; the required `GET /api/analytics` endpoint has not been created yet.
- ✅ **Analytics dashboard** – `src/app/dashboard/analytics/page.tsx` + `charts.tsx` render Chart.js visualizations for status counts, publications per year, and top venues.

## 3. Robustness & Error Handling

- ✅ **Toast notifications** – The global provider (`src/components/providers/toaster-provider.tsx`) plus usage in the create/edit forms surfaces success/error states instead of `alert`.
- ⚠️ **Backend input validation** – Only the paper detail route (`src/app/api/papers/[id]/route.ts`) uses Zod. Other endpoints (e.g., `POST /api/papers`) rely on manual checks. Zod schemas should wrap all public API payloads.
- ✅ **Role-based UI** – `src/app/dashboard/layout.tsx` reads the JWT and hides Create/Edit buttons from viewers.

## 4. Final Submission Prep

- ⚠️ **Final dump** – While `database/real_world_seed.sql` resets and seeds realistic data, there is no combined `final_submission.sql` that merges schema, stored procedures, and live data.
- ⚠️ **Verification** – Restore testing on a clean MySQL instance and a recorded demo (CRUD on papers/authors + Adminer proof) have not been captured in this repo.

### Next Steps

1. Add a `GET /api/analytics` route (wrapping the existing Prisma queries) and update the analytics page to consume it.
2. Introduce Zod schemas for other API payloads (`POST /api/papers`, grants, authorship mutations) to satisfy the validation requirement.
3. Produce `final_submission.sql` that concatenates schema, stored procedures, and exported data; document the restore steps in `docs/`.
4. Capture the required demo and add a link or instructions to the README.
