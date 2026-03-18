# PaperTrail – A Publication Management Dashboard

PaperTrail is a research-publication management platform for professors, graduate students, and research groups. It organizes papers, collaborators, venues, funding sources, and revision history in one relational database, with AI-powered semantic search and natural-language Q&A.

## Stack

- **Frontend / API**: Next.js 16 (App Router, API routes beside UI)
- **ORM**: Prisma
- **Database**: PostgreSQL 16 + pgvector via Docker
- **Semantic search**: OpenAI `text-embedding-3-small` (title + abstract embeddings)
- **RAG Q&A**: DeepSeek V3 via Volcengine Ark API

## Repository layout

```
.
├── docker-compose.yml         # PostgreSQL 16 + pgvector container
├── papertrail-app/            # Next.js 16 app (frontend + API)
│   ├── prisma/schema.prisma   # Relational model for PaperTrail
│   ├── scripts/               # Utility scripts (embedding backfill)
│   ├── src/app/api            # Health, papers, ask, and auth routes
│   └── src/app/dashboard/     # Dashboard UI with search & Ask AI
└── README.md                  # Project overview + workflow
```

## System prerequisites

- **Docker Desktop / Docker Engine** — hosts the PostgreSQL + pgvector container. Download from https://www.docker.com/products/docker-desktop.
- **Node.js 20.x** (LTS) — powers the Next.js application and Prisma CLI. Download from https://nodejs.org or install via `nvm install 20`.
- **git** — for cloning the repository.

## Full-stack spin-up

1. **Launch the database container**
   ```bash
   docker compose up -d
   ```
   PostgreSQL is available on port `5432`. Adminer (DB GUI) is at `http://localhost:8080`.

2. **Prepare the environment**

   ```bash
   cd papertrail-app
   cp .env.example .env.local   # Windows CMD: copy .env.example .env.local
   npm install
   ```

   Edit `.env.local` and set:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | `postgresql://papertrail:papertrail@localhost:5432/papertrail` |
   | `API_AUTH_TOKEN` | any secret string, e.g. `local-dev-token` |
   | `OPENAI_API_KEY` | your OpenAI key (for embedding generation) |
   | `DEEPSEEK_API_KEY` | your Volcengine Ark key (for Ask AI Q&A) |
   | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
   | `NEXT_PUBLIC_USER_ROLE` | `admin` (or `principal_investigator` / `viewer`) |

3. **Prisma client + schema sync**
   ```bash
   npm run prisma:generate
   npm run db:push
   ```

4. **Seed demo data**
   ```bash
   npm run db:seed
   ```

5. **Generate paper embeddings**
   ```bash
   npm run db:backfill
   ```
   This generates OpenAI embeddings (title + abstract) for all papers and stores them as pgvector vectors. Required for semantic search and Ask AI to work.

6. **Run the Next.js app**
   ```bash
   npm run dev
   ```
   - `http://localhost:3000` — landing page
   - `http://localhost:3000/dashboard` — main dashboard
   - `http://localhost:3000/api/health` — environment check

   **Demo login credentials** (password: `pass`):
   | Role | Email |
   |------|-------|
   | Admin | admin@papertrail.local |
   | Principal Investigator | priya.natarajan@yale.edu |
   | Contributor | lena.becker@tum.de |
   | Viewer | viewer@papertrail.local |

   **Adminer (DB GUI)** at `http://localhost:8080`:
   - System: PostgreSQL
   - Server: `db`
   - Username: `papertrail`
   - Password: `papertrail`
   - Database: `papertrail`

7. **Run tests**
   ```bash
   npm run test
   npm run test:coverage
   ```

## Features

### Semantic search
Type a natural-language query in the Dashboard search bar. Papers are ranked by cosine similarity using pgvector against OpenAI embeddings (input: `title + abstract`). Falls back to case-insensitive keyword search if embeddings are unavailable or the query is quoted.

### Ask AI (RAG Q&A)
A collapsible panel on the Dashboard. Enter a question in plain language (e.g. *"Which papers study transformer architectures?"*). The system:
1. Embeds the question via OpenAI
2. Retrieves the top-5 most relevant papers via pgvector
3. Sends the paper context to DeepSeek V3 to generate a grounded answer
4. Returns the answer alongside clickable source paper links

Role-based visibility is enforced: viewers only see Published papers; admin / PI see all statuses.

## Helpful Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm run start` | Production build + serve |
| `npm run lint` | ESLint on the entire app |
| `npm run prisma:generate` | Regenerate Prisma client after schema edits |
| `npm run db:push` | Apply Prisma schema to the dev database |
| `npm run db:migrate` | Create/apply migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:backfill` | Generate/refresh embeddings for all papers |
| `npm run db:studio` | Launch Prisma Studio (DB GUI) |
| `npm run test` | Jest in-band tests |
| `npm run test:coverage` | Jest with coverage report |
| `npm run test:mutation` | Stryker mutation testing |

## Error Handling & Safety Nets

- **API routes** validate all inputs and return correct HTTP status codes (400 / 401 / 403 / 404 / 500). Every try/catch logs the error before responding.
- **Role-based access**: write operations require `admin` or `principal_investigator` role; hard deletes are admin-only; viewers are restricted to Published papers.
- **Soft deletes**: papers are never physically dropped — `isDeleted` toggles and `ActivityLog` records every mutation.
- **Embedding failures**: if OpenAI is unavailable during paper creation/update, the embedding is skipped silently and search falls back to keyword matching.
- **LLM failures**: if DeepSeek is unavailable, the Ask AI endpoint returns a 500 with a clear error message.
