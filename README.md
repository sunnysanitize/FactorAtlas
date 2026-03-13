# FactorAtlas

FactorAtlas is a portfolio intelligence platform for stock portfolio analysis, built as a Next.js frontend with a FastAPI backend.

The current repo contains:

- a typed frontend scaffold in [`frontend/`](./frontend)
- a FastAPI backend scaffold in [`backend/`](./backend)
- planning and architecture docs at the repo root

This is an early-stage implementation. It can run locally, but some pieces are still scaffold-level and a few setup steps are manual.

## Repo Structure

```text
factoratlas/
  backend/
  frontend/
  design.md
  implementation-plan.md
  sprint-backlog.md
  repo-scaffold-plan.md
  system-architecture.md
```

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- Backend: FastAPI, SQLAlchemy, Alembic-ready structure
- Database: PostgreSQL
- Quant/Data: pandas, numpy, scipy, statsmodels, networkx
- Market data: yfinance
- AI: Gemini API

## Current Status

Implemented at scaffold level:

- portfolio dashboard shell
- portfolio creation and holdings routes
- analytics, graph, events, scenarios, and copilot route scaffolds
- backend services for quant, market data, themes, events, graph, scenarios, and AI
- frontend pages for dashboard, overview, holdings, risk, graph, scenarios, events, and copilot

Not fully production-ready yet:

- database migrations are not fully defined yet
- initial database table creation is manual
- some flows are scaffold/demo-grade rather than complete product logic
- AI and news features depend on API keys

## Prerequisites

You need:

- Node.js 20+
- npm
- Python 3.12
- Docker

## Quick Start

### 1. Configure the backend env

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with any API keys you want to use.

Current env vars:

- `APP_ENV`
- `DATABASE_URL`
- `AI_PROVIDER`
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `NEWS_API_KEY`
- `FINNHUB_API_KEY`
- `RISK_FREE_RATE`
- `CACHE_TTL_SECONDS`

### 2. Start the backend with Docker

```bash
docker compose -f docker-compose.backend.yml up --build
```

This starts PostgreSQL and the FastAPI backend together and bootstraps the database tables automatically.

Backend should be available at:

- `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 3. Configure the frontend

```bash
cd frontend
cp .env.local.example .env.local
```

Default API base URL:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 4. Install frontend dependencies and run

```bash
cd frontend
npm install
npm run dev
```

Frontend should be available at:

- `http://localhost:3000`

## Local Run Order

Start things in this order:

1. backend Docker stack
2. frontend

If the frontend loads but portfolio pages fail, the backend Docker stack is usually not running yet.

## Useful Commands

### Backend

Run backend stack:

```bash
docker compose -f docker-compose.backend.yml up --build
```

Stop backend stack:

```bash
docker compose -f docker-compose.backend.yml down
```

Run tests locally:

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
pytest
```

### Frontend

Run dev server:

```bash
cd frontend
npm run dev
```

Run lint:

```bash
cd frontend
npm run lint
```

## Known Caveats

- The frontend is not mocked. It expects the backend API to be live.
- The backend expects PostgreSQL immediately for portfolio routes.
- AI features may fail without a valid `GEMINI_API_KEY`.
- News/event features may fail without `NEWS_API_KEY` or `FINNHUB_API_KEY`.
- Market-data-dependent screens rely on external data availability from yfinance.
- Database setup currently requires manual table creation because full migrations are not in place yet.

## Key Docs

- Product spec: [design.md](./design.md)
- Execution plan: [implementation-plan.md](./implementation-plan.md)
- Sprint plan: [sprint-backlog.md](./sprint-backlog.md)
- Scaffold plan: [repo-scaffold-plan.md](./repo-scaffold-plan.md)
- Architecture: [system-architecture.md](./system-architecture.md)

## Recommended Next Improvements

The highest-value cleanup steps are:

1. add a proper first Alembic migration
2. add a DB bootstrap script instead of the manual `create_all` command
3. add a root-level dev script or `Makefile`
4. replace scaffold/demo behavior with fully tested MVP flows
