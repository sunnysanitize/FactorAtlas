# FactorAtlas Repo Scaffold Plan

## Goal

Define the initial repository structure, toolchain, and file layout so implementation can begin with minimal churn.

This scaffold plan is optimized for:

- fast MVP delivery
- clean separation between frontend and backend
- typed contracts and modular services
- later expansion into Insane Mode without large structural rewrites

## Top-Level Structure

```text
factoratlas/
  frontend/
  backend/
  docs/
  .gitignore
  README.md
```

Recommended documentation move once the repo grows:

- move `design.md`, `implementation-plan.md`, `sprint-backlog.md`, `repo-scaffold-plan.md`, and `system-architecture.md` into `docs/`

For now, keeping them at the root is acceptable while the repo is still early.

## Frontend Scaffold

### Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- react-force-graph

### Structure

```text
frontend/
  app/
    (marketing)/
      page.tsx
    dashboard/
      page.tsx
    portfolio/
      [id]/
        page.tsx
        holdings/
          page.tsx
        risk/
          page.tsx
        graph/
          page.tsx
        scenarios/
          page.tsx
        events/
          page.tsx
        copilot/
          page.tsx
        command-center/
          page.tsx
    globals.css
    layout.tsx
  components/
    cards/
    charts/
    command-center/
    forms/
    graph/
    layout/
    states/
    tables/
  lib/
    api/
      client.ts
      portfolio.ts
      analytics.ts
      events.ts
      scenarios.ts
      copilot.ts
      factors.ts
    constants/
    hooks/
    types/
      api.ts
      domain.ts
      ui.ts
    utils/
      format.ts
      chart.ts
      theme.ts
  public/
  tests/
```

### Frontend Early Components

Create these first:

- `AppShell`
- `Sidebar`
- `TopNav`
- `KpiCard`
- `SectionHeader`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ChartPanel`
- `DataTable`

### Frontend Future Components

These can wait until later phases:

- `RelationshipGraphPanel`
- `ScenarioRunner`
- `EventTable`
- `FactorExposureMatrix`
- `LookthroughExplorer`
- `EventPathwayExplorer`
- `EvidenceDrawer`
- `CommandCenterWorkspace`

## Backend Scaffold

### Stack

- FastAPI
- Python 3.12
- SQLAlchemy
- Alembic
- Pydantic
- PostgreSQL
- pandas / numpy / scipy / statsmodels / networkx

### Structure

```text
backend/
  app/
    api/
      deps.py
      router.py
      routes/
        health.py
        portfolios.py
        analytics.py
        events.py
        scenarios.py
        ai.py
        factors.py
        graph.py
    core/
      config.py
      logging.py
      security.py
    db/
      base.py
      session.py
    models/
      user.py
      portfolio.py
      holding.py
      price_history.py
      portfolio_snapshot.py
      news_event.py
      event_holding_relevance.py
      scenario.py
      entity.py
      entity_relationship.py
      factor_definition.py
      factor_exposure_snapshot.py
      etf_constituent.py
    schemas/
      common.py
      portfolio.py
      analytics.py
      events.py
      scenarios.py
      ai.py
      factors.py
      graph.py
    services/
      portfolio_service.py
      market_data_service.py
      quant_service.py
      theme_service.py
      news_service.py
      graph_service.py
      scenario_service.py
      ai_service.py
      factor_service.py
      lookthrough_service.py
      propagation_service.py
      entity_service.py
    utils/
      cache.py
      csv_parser.py
      dates.py
      math.py
      normalization.py
    main.py
  alembic/
  tests/
    api/
    services/
    unit/
  pyproject.toml
```

### Backend Initial Models

Implement first:

- `User`
- `Portfolio`
- `Holding`
- `PriceHistory`
- `PortfolioSnapshot`

### Backend Second-Wave Models

Implement once Phase 2 begins:

- `NewsEvent`
- `EventHoldingRelevance`
- `Scenario`

### Backend Insane Mode Models

Implement only when Phase 4 starts:

- `Entity`
- `EntityRelationship`
- `FactorDefinition`
- `FactorExposureSnapshot`
- `ETFConstituent`

## Docs Scaffold

Recommended structure once docs are moved:

```text
docs/
  design.md
  implementation-plan.md
  sprint-backlog.md
  repo-scaffold-plan.md
  system-architecture.md
  api-contracts.md
  runbook.md
```

## Config Files

### Root

Create:

- `.gitignore`
- `README.md`

Optional later:

- `.editorconfig`
- `.prettierrc`
- `Makefile`

### Frontend

Create:

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `postcss.config.js`
- `tailwind.config.ts`
- `components.json`
- `.eslintrc.json`
- `.env.local.example`

### Backend

Create:

- `pyproject.toml`
- `alembic.ini`
- `.env.example`

## Environment Variables

### Frontend

Start with:

- `NEXT_PUBLIC_API_BASE_URL`

Later add if needed:

- `NEXT_PUBLIC_APP_ENV`

### Backend

Start with:

- `APP_ENV`
- `DATABASE_URL`
- `GEMINI_API_KEY`
- `NEWS_API_KEY`
- `FINNHUB_API_KEY`
- `RISK_FREE_RATE`
- `CACHE_TTL_SECONDS`

Later add if needed:

- `MARKET_DATA_PROVIDER`
- `ETF_DATA_PROVIDER`

## Local Developer Workflow

### Recommended Commands

Root-level convention:

- `README.md` should document exact commands even if there is no root task runner initially

Frontend:

- install dependencies
- run dev server
- run lint
- run tests

Backend:

- create virtual environment
- install dependencies
- run migrations
- run API server
- run tests

### Optional Improvement

After initial setup, add a small root `Makefile` or task runner to standardize:

- `make frontend-dev`
- `make backend-dev`
- `make test`
- `make lint`

## API Contract Strategy

There are two workable approaches:

### Option A

Maintain separate frontend and backend types with a shared written contract document.

Pros:

- simple to start
- less tooling complexity

Cons:

- drift risk

### Option B

Generate frontend types from backend OpenAPI schema once the API stabilizes.

Pros:

- better long-term contract discipline

Cons:

- more setup overhead early

Recommendation:

- start with Option A in Phase 0 and Phase 1
- evaluate generated types after MVP endpoints stabilize

## Testing Scaffold

### Frontend

Start with:

- component smoke tests
- route rendering tests

Later add:

- interaction tests for table filtering, forms, and graph controls

### Backend

Start with:

- unit tests for quant math
- service tests for market data normalization
- API tests for portfolio flows

Later add:

- event pipeline tests
- propagation tests
- reverse stress tests

## Seed Data Strategy

Create a dedicated seed path early so the product can be demoed before real user data exists.

Recommended seed content:

- one diversified tech-heavy portfolio
- one concentrated semiconductor portfolio
- one ETF-heavy portfolio for future look-through demos
- sample cached price history for local development fallback

## Recommended Initial Build Order

1. Create `frontend/` and `backend/`.
2. Add backend app structure, DB setup, and initial migration.
3. Add frontend app shell and API client utilities.
4. Add portfolio models, schemas, and routes.
5. Add market data service and quant service.
6. Add MVP pages and charts.
7. Add grounded AI summary.
8. Add docs/ migration once the repo starts to fill out.

## Guardrails

- do not scaffold Insane Mode directories as fully active features on day one
- only add Phase 4 service and model files when that work begins
- keep the frontend component tree shallow at first
- avoid over-abstracting API clients before several endpoints exist
