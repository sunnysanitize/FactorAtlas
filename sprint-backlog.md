# Sprint Backlog

## Planning Assumptions

- Sprint length: 2 weeks
- Team shape assumed: 1 product-minded full-stack engineer or a small team working sequentially
- Priority: MVP first, Insane Mode only after the core analytics platform is stable
- Definition of sprint success: ship an end-to-end vertical slice, not isolated components

## Milestone Map

- Sprint 1-2: Foundation and portfolio ingestion
- Sprint 3-4: Quant analytics MVP
- Sprint 5-6: Frontend MVP and grounded AI
- Sprint 7-8: Intelligence layer
- Sprint 9+: Advanced quant and Insane Mode flagship differentiators

## Sprint 1: Foundation and Project Setup

### Sprint Goal

Stand up the monorepo structure, application skeletons, database connection, and baseline developer workflow.

### Stories

- Initialize `frontend/` with Next.js, TypeScript, Tailwind CSS, and shadcn/ui
- Initialize `backend/` with FastAPI app structure
- Add PostgreSQL config and SQLAlchemy setup
- Add Alembic migrations
- Create initial models for `User`, `Portfolio`, `Holding`, `PriceHistory`, and `PortfolioSnapshot`
- Add backend health endpoint
- Add frontend shell with layout, sidebar, and top nav placeholders
- Add lint, format, and test commands
- Add `.env.example` for frontend and backend

### Deliverables

- bootable frontend app
- bootable backend app
- working DB migration
- health check endpoint
- initial layout shell

### Exit Criteria

- `frontend` and `backend` run locally
- first migration applies cleanly
- one API request can be made from frontend to backend

## Sprint 2: Portfolio Ingestion

### Sprint Goal

Allow a user to create a portfolio and add holdings manually or by CSV with normalized, validated storage.

### Stories

- Build `POST /portfolios`, `GET /portfolios`, and `GET /portfolios/{portfolio_id}`
- Build `POST /portfolios/{portfolio_id}/holdings`
- Build `POST /portfolios/{portfolio_id}/upload-csv`
- Add CSV parser and schema validation
- Add ticker normalization and duplicate merge logic
- Add metadata enrichment stub for company name and sector
- Build portfolio create UI
- Build manual holding entry UI
- Build CSV upload UI with validation feedback
- Add tests for parsing, normalization, and duplicate handling

### Deliverables

- portfolio creation flow
- manual holdings flow
- CSV upload flow
- persisted holdings data

### Exit Criteria

- user can create a portfolio from the UI
- malformed CSVs produce clear validation errors
- duplicate tickers are merged deterministically

## Sprint 3: Market Data Pipeline

### Sprint Goal

Ingest current price and historical adjusted close data for holdings and SPY benchmark.

### Stories

- Implement `market_data_service.py`
- Add `fetch_ticker_metadata`
- Add `fetch_current_price`
- Add `fetch_price_history`
- Add `fetch_benchmark_history`
- Add normalized storage or cache strategy for fetched price history
- Add retry/error handling for invalid or partial ticker responses
- Add test fixtures for market data normalization
- Build backend endpoints for history and prices

### Deliverables

- working market data fetch path
- benchmark history ingestion
- normalized historical time series payloads

### Exit Criteria

- price history loads for a sample portfolio
- SPY benchmark is available for the same window
- invalid tickers fail gracefully

## Sprint 4: Quant Engine MVP

### Sprint Goal

Ship the first defensible quant engine and analytics endpoints.

### Stories

- Implement market value and total value calculations
- Implement daily and cumulative portfolio returns
- Implement annualized volatility
- Implement beta vs SPY
- Implement Sharpe ratio using configured risk-free rate
- Implement max drawdown
- Implement concentration metrics
- Implement correlation matrix
- Implement approximate risk contribution
- Add tests for all formulas
- Build overview and risk analytics endpoints

### Deliverables

- `GET /overview`
- `GET /risk`
- `GET /correlations`
- computed portfolio analytics for sample portfolios

### Exit Criteria

- analytics match expected test outputs
- overview and risk payloads are stable enough for frontend integration

## Sprint 5: MVP Dashboard UI

### Sprint Goal

Render the portfolio analytics in a usable institutional-style dashboard.

### Stories

- Build KPI cards
- Build overview page charts
- Build holdings table with sorting and search
- Build risk page summary cards
- Build risk contribution chart
- Build correlation heatmap
- Add empty, loading, and error states
- Add formatting utilities for currency, percentages, and dates

### Deliverables

- landing page
- overview page
- holdings page
- risk page

### Exit Criteria

- a user can inspect portfolio structure and risk from the UI without using the API directly

## Sprint 6: Grounded AI MVP

### Sprint Goal

Add a constrained AI explanation layer that interprets computed analytics without inventing numbers.

### Stories

- Implement `ai_service.py`
- Define prompt templates for summary, risk explanation, and diversification analysis
- Build `POST /portfolios/{portfolio_id}/copilot`
- Add strict structured analytics payload to prompt input
- Add frontend copilot panel or summary card
- Show evidence/source metrics beside AI output
- Add failure handling for unavailable model or incomplete analytics

### Deliverables

- grounded AI summary endpoint
- AI summary UI

### Exit Criteria

- AI output references backend metrics accurately
- unsupported questions degrade safely instead of hallucinating

## Sprint 7: Intelligence Layer I

### Sprint Goal

Add themes, event ingestion, and ranked relevance.

### Stories

- Implement theme mapping and multi-theme support
- Build theme exposure aggregation
- Implement `news_service.py`
- Add article fetch, dedupe, and normalization
- Add event classification
- Add event-to-holding relevance scoring
- Build events endpoint
- Build events page
- Add theme exposure cards and charts

### Deliverables

- theme engine
- events ingestion pipeline
- ranked events UI

### Exit Criteria

- portfolio shows thematic concentration
- events are ranked by portfolio relevance

## Sprint 8: Intelligence Layer II

### Sprint Goal

Add relationship graph and baseline scenario analysis.

### Stories

- Implement `graph_service.py`
- Implement graph nodes and edges for holdings, sectors, themes, macro factors, and events
- Build graph endpoint
- Implement `scenario_service.py`
- Add benchmark, sector, theme, and single-stock shock scenarios
- Build scenarios endpoints
- Build graph page with filters and details
- Build scenarios page with impact summaries

### Deliverables

- graph API and UI
- baseline scenario engine and UI

### Exit Criteria

- users can inspect graph relationships with explanations
- users can run predefined scenarios and see impact breakdowns

## Sprint 9: Advanced Quant

### Sprint Goal

Deepen the analytical engine before expanding into flagship differentiators.

### Stories

- Add historical VaR
- Add rolling volatility
- Add rolling beta
- Add rolling Sharpe where feasible
- refine risk contribution using covariance-aware methods
- add richer charting for advanced metrics
- improve caching and response times

### Deliverables

- advanced risk metrics endpoints
- rolling metrics charts

### Exit Criteria

- advanced quant metrics are tested, visible, and interpretable

## Sprint 10: Flagship Differentiator I

### Sprint Goal

Ship factor intelligence as the first Insane Mode feature.

### Stories

- define factor taxonomy
- implement factor exposure model
- compute factor exposure outputs for portfolios and holdings
- build factor exposure API
- build factor UI cards and charts
- add factor-based risk explanation surfaces

### Deliverables

- factor intelligence endpoint
- factor exposure UI

### Exit Criteria

- hidden portfolio drivers are visible beyond sectors and themes

## Sprint 11: Flagship Differentiator II

### Sprint Goal

Ship look-through exposure and overlap analysis.

### Stories

- add ETF constituent ingestion
- implement look-through decomposition
- compute direct plus indirect concentration
- compute overlap and redundancy
- build look-through and overlap endpoints
- build decomposition explorer UI

### Deliverables

- look-through engine
- overlap explorer

### Exit Criteria

- ETF wrappers can be decomposed into actual underlying exposure

## Sprint 12: Flagship Differentiator III

### Sprint Goal

Ship causal event propagation.

### Stories

- add entity model and relationship model
- implement event-to-entity and entity-to-holding pathways
- add evidence metadata to path output
- build propagation endpoints
- build pathway explorer UI

### Deliverables

- propagation engine
- causal event pathway UI

### Exit Criteria

- users can inspect how an event matters through an explicit path

## Sprint 13: Flagship Differentiator IV

### Sprint Goal

Ship reverse stress and vulnerability analysis.

### Stories

- implement reverse stress scenario logic
- identify correlated failure clusters
- rank top structural vulnerabilities
- build vulnerability endpoints
- build vulnerability and reverse stress UI

### Deliverables

- reverse stress engine
- vulnerability leaderboard

### Exit Criteria

- the system can identify how the portfolio is most likely to break

## Sprint 14: Command-Center Mode

### Sprint Goal

Unify flagship intelligence features into an operational workflow.

### Stories

- build command-center route
- add synchronized filters across graph, events, factors, and scenarios
- add evidence drawer
- add event rail
- add time scrubber for event/risk replay
- improve interaction polish for dense workflows

### Deliverables

- command-center UI mode

### Exit Criteria

- users can move across events, factors, graph edges, and scenarios in one coherent workflow

## Ongoing Backlog

These should stay visible across all sprints:

- performance optimization
- observability and logging
- test coverage expansion
- seed/demo portfolio improvements
- accessibility improvements
- auth and user management hardening
- deployment automation

## Prioritization Rules

- never let UI get ahead of analytics truth
- never let AI get ahead of structured evidence
- only start a flagship differentiator when the prior layer is stable
- prefer one fully-realized differentiator over three shallow ones
