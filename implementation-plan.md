# Implementation Plan

## Goal

Build the portfolio intelligence platform in production-style phases, with each phase ending in a usable, testable product increment.

The build order should optimize for:

1. data model correctness
2. reliable market data ingestion
3. defensible quant calculations
4. clear typed API contracts
5. dashboard usability
6. grounded AI explanations
7. intelligence features layered on top of real analytics

## Delivery Strategy

Treat this as a staged platform build, not a parallel feature dump.

- Phase 0 establishes the repo, tooling, environments, and contracts.
- Phase 1 delivers a usable MVP around portfolio ingestion and core quant analytics.
- Phase 2 adds intelligence features that depend on Phase 1 outputs.
- Phase 3 improves quant depth, robustness, and scenario realism.

Each phase should finish with:

- complete backend endpoints for that slice
- complete frontend views for that slice
- typed request and response models
- tests for critical calculations and ingestion behavior
- seeded demo data or sample portfolio flows

## Implementation Principles

- Never use AI for numeric calculation.
- Build the quant engine before building AI narratives.
- Keep service boundaries explicit so later data vendors can be swapped in.
- Prefer deterministic enrichment over opaque heuristics for MVP.
- Use a shared contract layer so frontend and backend stay aligned.
- Ship thin vertical slices that are usable end to end.

## Proposed Stack Decisions

To reduce early ambiguity, use these defaults unless there is a reason to change them:

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Backend: FastAPI, Python 3.12
- Database: PostgreSQL
- ORM: SQLAlchemy + Alembic
- Background jobs for MVP: synchronous service calls with caching
- Market data: yfinance
- News data: Finnhub or NewsAPI
- AI: Gemini API
- Charts: Recharts for standard visualizations
- Graph visualization: react-force-graph

## Workstreams

The project breaks into six implementation workstreams:

1. Platform foundation
2. Portfolio and data ingestion
3. Quant analytics engine
4. Frontend dashboard and UX
5. Intelligence layer
6. Reliability, testing, and deployment

## Phase 0: Foundation

### Objective

Create a working monorepo-style structure, environment setup, database foundation, and typed contracts so feature work can proceed without churn.

### Deliverables

- `frontend/` initialized with Next.js, TypeScript, Tailwind, and shadcn/ui
- `backend/` initialized with FastAPI app structure
- PostgreSQL connection configured
- SQLAlchemy models and Alembic migrations initialized
- environment variable strategy documented in `.env.example`
- shared API conventions defined
- initial demo seed strategy decided

### Backend Tasks

- create FastAPI app entrypoint and router registration
- set up config management for env vars
- set up SQLAlchemy session management
- create initial models for `User`, `Portfolio`, `Holding`, `PriceHistory`, and `PortfolioSnapshot`
- add first Alembic migration
- define Pydantic schemas for requests and responses

### Frontend Tasks

- create base app shell
- create global layout, sidebar, top nav, and dashboard frame
- configure API client utilities and shared types
- establish design tokens for the dark institutional visual system

### Infrastructure Tasks

- define local development workflow
- define backend and frontend start commands
- set up linting and formatting
- set up basic test runners

### Acceptance Criteria

- frontend boots locally
- backend boots locally
- database migration runs successfully
- a health endpoint responds
- at least one typed API call works end to end

## Phase 1: MVP Analytics Platform

### Objective

Deliver a fully usable product that supports portfolio creation, holdings ingestion, market data fetching, and core portfolio/risk analytics with a working dashboard.

### Scope

- portfolio creation
- manual holding entry
- CSV upload
- ticker enrichment
- price history ingestion
- overview page
- holdings page
- core risk page
- correlation heatmap
- AI portfolio summary grounded in computed metrics

### Backend Implementation

#### 1. Portfolio Management

Build:

- `POST /portfolios`
- `GET /portfolios`
- `GET /portfolios/{portfolio_id}`
- `POST /portfolios/{portfolio_id}/holdings`
- `POST /portfolios/{portfolio_id}/upload-csv`

Required behavior:

- validate ticker, shares, and average cost
- normalize tickers to uppercase
- merge duplicate ticker rows on upload
- enrich missing company metadata
- store holdings cleanly

#### 2. Market Data Service

Build:

- ticker metadata lookup
- current price fetch
- historical adjusted close fetch
- SPY benchmark fetch
- cache layer for repeated requests

Required behavior:

- avoid duplicate fetches for the same ticker/date range
- gracefully handle delisted or invalid tickers
- return normalized historical time series

#### 3. Quant Engine

Implement and test:

- market value per holding
- total portfolio value
- daily portfolio return series
- cumulative return series
- annualized volatility
- beta vs SPY
- Sharpe ratio using configured risk-free rate
- max drawdown
- concentration metrics
- correlation matrix
- approximate risk contribution by position

#### 4. Analytics Endpoints

Build:

- `GET /portfolios/{portfolio_id}/overview`
- `GET /portfolios/{portfolio_id}/history`
- `GET /portfolios/{portfolio_id}/prices`
- `GET /portfolios/{portfolio_id}/risk`
- `GET /portfolios/{portfolio_id}/correlations`

Response design should include:

- raw time series for charts
- pre-aggregated KPI values
- typed objects for holdings, allocations, and correlations

#### 5. AI Summary Endpoint

Build:

- `POST /portfolios/{portfolio_id}/copilot`

MVP restrictions:

- support portfolio-summary and simple risk/diversification prompts first
- only pass computed metrics and exposure data into Gemini
- reject or constrain unsupported requests rather than hallucinating

### Frontend Implementation

#### 1. Landing and App Shell

Build:

- landing page
- global layout
- sidebar navigation
- top status bar

#### 2. Portfolio Creation Flow

Build:

- create portfolio form
- manual holdings form
- CSV upload flow
- upload validation feedback

#### 3. Overview Page

Build:

- KPI cards
- portfolio value chart
- cumulative return chart
- allocation by holding
- allocation by sector
- allocation by theme placeholder if themes are not fully shipped yet

#### 4. Holdings Page

Build:

- holdings table
- sorting
- text search
- filters for sector and ticker

#### 5. Risk Page

Build:

- volatility, beta, Sharpe, and drawdown summary cards
- concentration metrics card
- risk contribution chart
- correlation heatmap

#### 6. AI Summary UI

Build:

- summary card or copilot panel
- loading and failure states
- explicit source metrics section for trust

### Data and Domain Tasks

- define initial sector/theme enrichment strategy
- create starter ticker-to-theme JSON map for common demo names
- create sample portfolio fixtures for local testing

### Testing Requirements

- unit tests for quant formulas
- unit tests for CSV normalization and duplicate merging
- service tests for market data normalization
- API tests for portfolio create/read flows
- frontend smoke tests for primary pages if time permits

### Acceptance Criteria

- a user can create a portfolio manually or by CSV
- the system fetches market data and benchmark data
- the dashboard shows computed portfolio KPIs
- the risk page shows defensible analytics and correlation output
- the AI summary references real numbers returned by backend analytics
- the MVP is usable without intelligence graph or event ingestion

## Phase 2: Intelligence Layer

### Objective

Add theme, event, graph, and scenario capabilities on top of the MVP analytics foundation.

### Scope

- theme engine
- event ingestion
- relevance ranking
- graph relationships
- scenario analysis

### Backend Implementation

#### 1. Theme Engine

Build:

- multi-theme support per holding
- portfolio weight by sector
- portfolio weight by theme
- top theme concentration outputs

Required behavior:

- map holdings to curated themes
- expose confidence or source when enrichment is weak

#### 2. News/Event Pipeline

Build:

- fetch recent news for portfolio tickers
- deduplicate events by URL/title
- normalize article metadata
- classify event category
- generate short event summary
- store event-holding relevance links

Required outputs:

- ranked events for a portfolio
- affected holdings list
- explanation fields for why each event matters

#### 3. Graph Engine

Build:

- node generation for holdings, sectors, themes, macro factors, and events
- edge generation for sector/theme membership
- correlation-based edges above threshold
- event relevance edges
- graph filtering support

Build endpoint:

- `GET /portfolios/{portfolio_id}/graph`

#### 4. Scenario Engine

Build:

- benchmark shock scenarios
- sector shock scenarios
- theme shock scenarios
- single-stock shock scenarios
- custom manual shock scenarios

Build endpoints:

- `POST /portfolios/{portfolio_id}/scenarios/run`
- `GET /portfolios/{portfolio_id}/scenarios`

### Frontend Implementation

#### 1. Theme and Exposure Surfaces

Build:

- theme allocation chart
- top themes card
- hidden concentration callouts

#### 2. Events Page

Build:

- ranked event table
- event detail drawer or panel
- affected holdings and categories
- AI explanation snippets grounded in event and portfolio data

#### 3. Intelligence Graph Page

Build:

- interactive graph canvas
- filters by node type
- minimum edge weight control
- node detail side panel
- highlighted neighbor interactions

#### 4. Scenario Page

Build:

- predefined scenario runner
- custom scenario form
- impact summary cards
- impact by holding/sector/theme tables or charts

### Testing Requirements

- tests for theme aggregation
- tests for event deduplication
- tests for scenario impact calculations
- tests for graph generation structure

### Acceptance Criteria

- the system can show thematic concentration beyond sector labels
- recent events are ranked by portfolio relevance rather than dumped raw
- users can inspect an interactive relationship graph with meaningful edges
- users can run scenarios and see portfolio impact breakdowns

## Phase 3: Advanced Quant and Robustness

### Objective

Improve analytical depth and model quality after the core product is already usable.

### Scope

- historical VaR
- rolling metrics
- better risk contribution methods
- improved scenario realism
- performance and reliability work

### Backend Implementation

Build and refine:

- one-day historical VaR at 95 percent
- optional CVaR
- rolling volatility
- rolling beta
- rolling Sharpe where data quality supports it
- covariance-adjusted risk contribution
- scenario persistence and comparison history

### Frontend Implementation

Build:

- rolling metrics charts
- VaR and drawdown detail panels
- scenario comparison views
- richer risk explanation surfaces

### Reliability Work

- improve caching strategy
- add background refresh jobs if synchronous fetching becomes too slow
- improve API timeout and retry behavior
- add data freshness indicators in UI
- add error handling for incomplete market or news data

### Acceptance Criteria

- advanced metrics are visible and tested
- performance remains acceptable with medium-sized portfolios
- risk outputs remain interpretable and tied to backend calculations

## Detailed Task Breakdown By Layer

### Backend Services

Implement in this order:

1. `portfolio_service.py`
2. `market_data_service.py`
3. `quant_service.py`
4. `theme_service.py`
5. `ai_service.py`
6. `news_service.py`
7. `graph_service.py`
8. `scenario_service.py`

Reasoning:

- portfolio and market data are prerequisites
- quant outputs must exist before AI or intelligence features
- graph, events, and scenarios depend on portfolio, theme, and correlation outputs

### Database Models

Implement initial models first:

- `User`
- `Portfolio`
- `Holding`
- `PriceHistory`
- `PortfolioSnapshot`

Add second-wave models in Phase 2:

- `NewsEvent`
- `EventHoldingRelevance`
- `Scenario`

Potential Phase 3 additions:

- `ThemeMapping`
- `ScenarioRun`
- `CachedAnalyticsPayload`

### Frontend Routes

Implement in this order:

1. `/`
2. `/dashboard`
3. `/portfolio/[id]`
4. `/portfolio/[id]/holdings`
5. `/portfolio/[id]/risk`
6. `/portfolio/[id]/copilot`
7. `/portfolio/[id]/events`
8. `/portfolio/[id]/graph`
9. `/portfolio/[id]/scenarios`

### Frontend Components

Build reusable components early:

- app shell
- KPI card
- section header
- empty state
- loading state
- error state
- chart wrappers
- table primitives

Then feature components:

- holdings table
- correlation heatmap
- risk contribution chart
- event table
- relationship graph panel
- scenario impact cards

## API Contract Planning

Define the response shapes before deep frontend work begins.

Priority contracts:

- `PortfolioSummary`
- `HoldingRow`
- `PortfolioOverviewResponse`
- `PortfolioRiskResponse`
- `CorrelationMatrixResponse`
- `ThemeExposureResponse`
- `PortfolioGraphResponse`
- `ScenarioRunResponse`
- `PortfolioCopilotResponse`

Frontend and backend should share a written contract reference, even if types are duplicated initially.

## Design and UX Plan

### Visual System

Establish a consistent dark analytical visual language in Phase 0:

- muted charcoal or graphite base
- restrained accent colors tied to semantic meaning
- dense but readable panels
- clear hierarchy for KPIs, charts, and explanatory text

### UX Priorities

- portfolio creation should be fast and obvious
- charts should support interpretation, not decoration
- every major number should have context nearby
- AI summaries should sit beside the underlying metrics they interpret
- graph interactions should expose real relationship logic

## Testing Strategy

### Unit Tests

Focus on deterministic logic:

- return calculations
- beta
- Sharpe
- drawdown
- concentration metrics
- VaR
- CSV parsing and normalization
- scenario shock application

### Integration Tests

Focus on:

- portfolio creation and retrieval
- ingestion plus analytics pipeline
- event fetch and storage pipeline
- graph payload generation

### Frontend Tests

Focus on:

- route rendering
- form validation
- major table/chart presence
- loading and error states

## Risks and Mitigations

### Risk: External data quality is inconsistent

Mitigation:

- normalize and validate all vendor responses
- cache aggressively
- expose stale or incomplete data states in UI

### Risk: Quant outputs become hard to trust

Mitigation:

- test formulas directly
- show benchmark assumptions and sample windows
- keep AI narrative downstream of analytics only

### Risk: The graph becomes decorative

Mitigation:

- only render explicit, explainable edge types
- require explanation text on edges
- expose filtering so the graph remains interpretable

### Risk: Scope expands too early

Mitigation:

- keep Phase 1 focused on portfolio ingestion and core analytics
- defer event graph sophistication and advanced scenario modeling

## Immediate Build Order

This is the recommended execution order for the first implementation sprint:

1. Scaffold frontend and backend projects.
2. Set up PostgreSQL, SQLAlchemy models, and Alembic.
3. Implement portfolio CRUD and holding ingestion.
4. Implement market data fetching and normalization.
5. Implement quant engine with tests.
6. Expose overview, history, risk, and correlations endpoints.
7. Build overview, holdings, and risk pages.
8. Add grounded AI summary using computed analytics only.
9. Seed a demo portfolio and validate the full flow.

## Definition of Done For MVP

The MVP is done when:

- a new user can create a portfolio
- holdings can be entered manually or uploaded by CSV
- prices and benchmark history are fetched successfully
- portfolio performance and risk metrics are computed correctly
- the frontend renders overview, holdings, and risk views
- the AI layer produces grounded summaries without inventing numbers
- the system is coherent and useful before theme/event/graph/scenario work begins

## Recommended Next Step

Start implementation with Phase 0 and the first half of Phase 1:

- scaffold project structure
- configure database and migrations
- implement portfolio ingestion
- implement market data service
- implement quant service with tests

That sequence creates the foundation the rest of the product depends on.
