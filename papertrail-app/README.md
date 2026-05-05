## PaperTrail Web App

PaperTrail is the SunXHoC team's research-publication management platform. This folder contains the Next.js frontend, API routes, Prisma integration, and AI-powered search & Q&A.

### Stack

- **Frontend / API**: Next.js 16 (App Router)
- **ORM**: Prisma
- **Database**: PostgreSQL 16 + pgvector (via Docker)
- **Semantic search**: OpenAI `text-embedding-3-small`
- **RAG Q&A**: DeepSeek V4 Flash via DeepSeek API

### Prerequisites

- Node 20+
- Docker Desktop (for the PostgreSQL + pgvector container)

### Environment

Copy the sample env file and fill in the required values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (default Docker: `postgresql://papertrail:papertrail@localhost:5432/papertrail`) |
| `API_AUTH_TOKEN` | Bearer token for API routes |
| `OPENAI_API_KEY` | OpenAI key for generating embeddings |
| `DEEPSEEK_API_KEY` | DeepSeek API key for RAG Q&A |
| `NEXT_PUBLIC_APP_URL` | App base URL (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_USER_ROLE` | Default role for UI (`admin`, `principal_investigator`, `viewer`) |

### Install & run

```bash
# 1. Start the database
docker compose up -d          # from repo root

# 2. Install dependencies
cd papertrail-app
npm install

# 3. Generate Prisma client and push schema
npm run prisma:generate
npm run db:push               # or db:migrate

# 4. Seed demo data
npm run db:seed

# 5. Generate embeddings for all papers
npm run db:backfill

# 6. Start dev server
npm run dev
```

- `http://localhost:3000` — landing page
- `http://localhost:3000/dashboard` — main dashboard with search & Ask AI
- `http://localhost:3000/api/health` — environment check

### Features

- **Semantic search**: type a natural-language query in the Dashboard search bar — papers are ranked by embedding similarity (OpenAI `text-embedding-3-small`, input: `title + abstract`). Falls back to case-insensitive keyword search if embeddings are unavailable.
- **Ask AI (RAG)**: collapsible panel on the Dashboard. Enter a question in plain language; the system retrieves the top-5 most relevant papers via pgvector and uses DeepSeek V4 Flash to generate a grounded answer with source citations.
- **Role-based visibility**: viewers only see Published papers; admin / principal_investigator see all statuses.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (with filesystem polling for Windows) |
| `npm run build` / `npm run start` | Production build + serve |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Regenerate Prisma client after schema edits |
| `npm run db:push` | Apply Prisma schema to the database |
| `npm run db:migrate` | Create/apply named migrations |
| `npm run db:seed` | Seed demo users, papers, and venues |
| `npm run db:backfill` | Generate/refresh embeddings for all papers |
| `npm run db:studio` | Prisma Studio (DB GUI) |
| `npm run test` | Jest tests (in-band) |
| `npm run test:coverage` | Jest with coverage report |

### Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── papers/
│   │   │   ├── route.ts          # GET (semantic + keyword search), POST, DELETE
│   │   │   ├── [id]/route.ts     # GET, PATCH individual paper
│   │   │   └── ask/route.ts      # POST — RAG Q&A endpoint
│   │   ├── auth/                 # Login / logout
│   │   └── health/               # Health check
│   └── dashboard/
│       ├── page.tsx              # Main dashboard (paper feed + Ask AI)
│       ├── dashboard-ask.tsx     # Ask AI client component
│       └── dashboard-search.tsx  # Search + status filter client components
└── lib/
    ├── embeddings.ts             # OpenAI embedding generation + save
    ├── llm.ts                    # DeepSeek V4 Flash chat completion wrapper
    └── prisma.ts                 # Prisma client singleton
```
