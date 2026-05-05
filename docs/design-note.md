# Paper-Trail Design Note

> A record of the technical decisions and evolution of the project from a course assignment to a production-ready system.

---

## 1. Background and Origin

**Paper-Trail** originated as a CS 5200 Database course project (2025-11-14), initiated by Hans (`hans2001`) with collaboration from Sheeran. From March 2026 onwards, Sheeran (`Dimcirui`) took over technical development and migrated the project to the `Dimcirui/Paper-Trail` repository.

**Purpose**: An academic publication management dashboard. The core requirement is to provide research teams with full paper lifecycle management (CRUD), multi-dimensional analytics, and AI-assisted search.

**Initial tech stack (2025-11-14, commit `32cdd89`)**:

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (App Router) + TypeScript |
| CSS | Tailwind CSS + PostCSS |
| ORM | Prisma |
| Database | MySQL (Docker Compose) |
| DB access | `mysql2` connection pool + stored procedures |
| Auth | None (added later) |
| API style | Next.js API Routes (RESTful) |
| Code quality | ESLint, Husky pre-commit/pre-push hooks |
| CI | GitHub Actions (Node.js 20, Jest + Stryker mutation testing) |

The Prisma schema already defined a complete academic data model in the initial commit: `User`, `Paper`, `Author`, `Venue`, `Grant`, `Revision`, `ActivityLog`, `PaperAuthor`, `PaperGrant`, etc.

---

## 2. Evolution Timeline

### Phase 1: Course Scaffolding (2025-11-14 ~ 11-17)

- `32cdd89` — Created `papertrail-app/`, introduced Next.js + Prisma + MySQL, defined full schema
- `32b771a` — Added `docker-compose.yml`, `database/stored_procedures.sql` (290 lines of stored procedures)
- `cec35f5` — Introduced Husky + GitHub Actions CI pipeline
- `8b506a4` — Fixed MySQL 8.0 compatibility (prepared statements)
- `1713591` — Implemented soft-delete via stored procedures
- `5486048` — First frontend page: DashboardPage component

### Phase 2: Auth System + Page Architecture (2025-11-17 ~ 11-22)

- `a9405d7` — Login functionality + auth error handling
- `d40a109` — JWT auth (`jose`) + `UserContext` + `middleware.ts` RBAC
- `41384eb` — Four-page architecture: Dashboard / Browser / Analytics / Manage
- `d55c345` — GET papers endpoint with search and filtering
- `99ecec1` — PATCH endpoint + ManagePage paper editing
- `12b6c27` — TrashPage + RestoreButton + role-based permission improvements

### Phase 3: Test Coverage + UI Polish (2025-11-23 ~ 11-24)

- `7c7eebd` — Introduced Jest + Stryker; added `route.test.ts`, `auth.test.ts`, `detail.test.ts`; created `auth.ts` module
- `125c1dc` — Refactored auth flow, created `real_world_seed.sql`, introduced Chart.js charts
- `9a50739` — Activity Feed + requirements tracking document
- `52a8d17` — Grant association / disassociation functionality
- `efbaf0c` — Analytics charts: Grant data visualization

### Phase 4: Code Freeze and Course Submission (2025-12-02 ~ 12-04)

- `1adcfae` — "code freeze": cleaned up test data files
- `455d486` — Generated `final_submission.sql` (721-line full database export)
- `d6b6a45` — Soft-delete confirmation dialog

### Phase 5: MySQL → PostgreSQL + Semantic Search (2026-03-14)

The most significant technical transformation in the project, completed across four migration phases in a single day:

- `b5f3769` — **Database migration**: Prisma provider switched from `mysql` → `postgresql`, removed `mysql2`, Docker Compose updated to use `pgvector/pgvector:pg17`, all raw SQL migrated from MySQL to PostgreSQL syntax
- `a8b4865` — **Embedding pipeline**: created `src/lib/embeddings.ts` (OpenAI `text-embedding-3-small`) + `scripts/backfill-embeddings.ts` (batch backfill)
- `346dc37` — **Semantic search**: cosine distance queries using the `<->` operator; short queries and quoted queries fall back to `ILIKE` keyword search
- `be59ee0` — **Docker deployment**: Next.js standalone multi-stage Dockerfile; docker-compose extended with `app` and `adminer` services

### Phase 6: RAG Q&A + DeepSeek V3 (2026-03-18)

- `315e6e5` — **RAG Q&A**: `/api/papers/ask` endpoint; created `src/lib/llm.ts` (DeepSeek V3 integration); collapsible Q&A panel in the frontend
- `ab4d446` — Settled on Volcengine Ark endpoint (`deepseek-v3-2-251201`); later upgraded to `deepseek-v4-flash` and migrated to DeepSeek API (`api.deepseek.com`)

### Phase 7: UI Unification + Analytics Expansion (2026-03-27 ~ 03-31)

- `db05417` — Cleaned up residual MySQL syntax; unified all queries to PostgreSQL-compatible syntax
- 12 consecutive style commits — UI design unification: slate color palette, `rounded-2xl` corners, redesigned landing page, SVG icons, `aria-hidden` accessibility attributes
- `cd792fa` — **Analytics expansion**: added `GET /api/analytics` (210 lines, 8 data queries) covering topic distribution, venue tiering, cycle analysis, top contributors, institution distribution, and submission funnel
- `a684b23` — Coverage tests for `GET /api/analytics`

---

## 3. Technology Landscape

### Frontend

| Dimension | Technology | Version |
| --- | --- | --- |
| Framework | Next.js App Router | 16.0.3 |
| Language | TypeScript | ^5 |
| UI rendering | React | 19.2.0 |
| CSS | Tailwind CSS | ^4 (v4 new architecture) |
| Charts | Chart.js + react-chartjs-2 | ^4.5.1 / ^5.3.1 |
| Form validation | Zod | ^4.1.12 |
| Toast notifications | react-hot-toast | ^2.6.0 |
| JWT handling | jose | ^6.1.2 |
| State management | React Context (`UserContext`) | no external library |
| Data fetching | Native fetch (Server + Client Components) | no SWR/React Query |

### Backend

| Dimension | Technology | Version |
| --- | --- | --- |
| Runtime | Node.js | 20.x LTS |
| Framework | Next.js API Routes (App Router `route.ts`) | 16.0.3 |
| ORM | Prisma | ^6.19.0 |
| Database | PostgreSQL + pgvector | PG 17 |
| API style | RESTful (GET / POST / PATCH / DELETE) | — |
| Auth | Cookie-based JWT (jose) + RBAC | — |
| Input validation | Zod (select endpoints) + manual validation | — |

### AI / Vector Search

| Dimension | Technology | Details |
| --- | --- | --- |
| Embedding model | OpenAI `text-embedding-3-small` | 1536 dimensions |
| Vector database | pgvector (PostgreSQL extension) | cosine distance `<->` |
| Vector field | `Unsupported("vector(1536)")` | queried via `$queryRaw` |
| LLM | DeepSeek V4 Flash (`deepseek-v4-flash`) | DeepSeek API |
| LLM SDK | OpenAI SDK (compatible interface) | ^6.29.0 |
| RAG pipeline | question embedding → pgvector top-5 → DeepSeek V3 generation | `/api/papers/ask` |

### Infrastructure

| Dimension | Technology |
| --- | --- |
| Containerization | Docker Compose (db + app + adminer, 3 services) |
| DB image | `pgvector/pgvector:pg17` |
| App build | Next.js standalone multi-stage Dockerfile |
| DB GUI | Adminer 4 (port 8080) |
| CI/CD | GitHub Actions (Node 20, Jest coverage + Stryker mutation testing) |
| Code quality | Husky pre-commit (lint-staged + ESLint) + pre-push |
| Test framework | Jest ^30.2.0 + ts-jest ^29.4.5 |
| Mutation testing | Stryker Mutator ^9.4.0 |

---

## 4. Decision Rationale

### MySQL → PostgreSQL + pgvector

Core pain point (documented in `upgrade_plan.md`):

> Searching "neural network" returns no results for "deep learning" papers; searching "climate" misses work on "global warming".

`LIKE %query%` keyword matching cannot capture semantic relatedness. pgvector is a PostgreSQL-only extension, so migrating to PostgreSQL allows the vector store to share the same database instance — no need to deploy a separate vector database such as Pinecone or Milvus.

### `text-embedding-3-small`

Low cost, no self-hosted inference required, and 1536-dimensional vector quality is sufficient for the workload.

### DeepSeek V4 Flash via DeepSeek API

Called via DeepSeek's own API (`api.deepseek.com`) through the OpenAI-compatible SDK interface. Highly cost-effective, and switching providers requires only a `baseURL` + `model` change.

### Full-stack Next.js (no separate backend service)

Frontend and backend share the same Next.js application (API Routes co-located with UI pages), simplifying deployment (single container) and sharing TypeScript type definitions. This is appropriate for the current project scale.

### Prisma `$queryRaw` for vector queries

Prisma does not natively support pgvector types and operators; vector fields are declared as `Unsupported("vector(1536)")` and all similarity queries are executed via `$queryRaw`.

### Async embedding generation

Embeddings are generated asynchronously when a paper is saved; failures silently fall back to keyword search. A pragmatic minimum-viable approach that can be upgraded to a BullMQ queue later.

---

## 5. Current Status and Backlog

### Completed

- Full paper CRUD lifecycle (create, edit, detail view, soft-delete, trash restore)
- Auth and permissions (JWT login/logout, 4-role RBAC: admin / principal_investigator / contributor / viewer)
- Semantic search (OpenAI embedding + pgvector cosine ranking; short queries fall back to ILIKE)
- RAG Q&A (embedding retrieval of top-5 → DeepSeek V3 answer generation + source citations)
- Analytics dashboard (Phase 1 + 2.1/2.2 + 3.1 complete):
  - Topic distribution horizontal bar
  - Venue tiering analysis (Doughnut + ranking bar)
  - Submission-to-publication cycle analysis (KPI cards + line chart)
  - Top 10 contributors + Top 10 institution distribution
  - Submission funnel (Draft → Submitted → … → Published conversion rate)
- Docker deployment (PG + App + Adminer full compose)
- CI/CD (GitHub Actions: Jest coverage + Stryker mutation testing)
- UI unification (slate color palette, `rounded-2xl` corners, SVG icons, `aria-hidden` accessibility)

### Backlog

| Priority | Item | Category |
| --- | --- | --- |
| Medium | Analytics 2.3: average authors per paper (by year) | Analytics Phase 2 |
| Medium | Analytics 3.2: average time-in-stage (using adjacent `ActivityLog` status timestamps) | Analytics Phase 3 |
| Low | Analytics 3.3: stale draft monitoring panel | Analytics Phase 3 |
| Low | Analytics 4.1: research direction clustering (k-means on embeddings) | Analytics Phase 4 – AI |
| Low | Analytics 4.2: topic correlation heatmap | Analytics Phase 4 – AI |
| Low | Analytics 4.3: search + analytics cross-linking | Analytics Phase 4 – AI |
| Medium | Grant management UI (currently only associable inside the Manage view; no standalone CRUD) | CRUD completeness |
| Medium | Full Zod validation coverage (currently only select endpoints use Zod; others rely on manual validation) | Robustness |
