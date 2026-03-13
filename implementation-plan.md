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
8. flagship differentiators that make the product feel closer to a market operating system than a portfolio app

## Delivery Strategy

Treat this as a staged platform build, not a parallel feature dump.

- Phase 0 establishes the repo, tooling, environments, and contracts.
- Phase 1 delivers a usable MVP around portfolio ingestion and core quant analytics.
- Phase 2 adds intelligence features that depend on Phase 1 outputs.
- Phase 3 improves quant depth, robustness, and scenario realism.
- Phase 4 activates Insane Mode with factor intelligence, look-through exposure, causal event propagation, adversarial scenarios, and command-center workflows.

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
- Add differentiated intelligence only when the upstream evidence model is explicit and inspectable.
- Every advanced insight should be traceable to underlying holdings, factors, events, or graph edges.

## Flagship Differentiators

These are the features that can make the platform feel materially more ambitious than a strong portfolio dashboard.

### 1. Portfolio Knowledge Graph

Make the core system graph-native rather than page-native.

The graph should unify:

- holdings
- sectors
- themes
- macro factors
- events
- suppliers
- customers
- competitors
- geographies
- ETFs and underlying constituents

This turns the graph into a reasoning surface rather than a decorative visualization.

### 2. Factor Intelligence Layer

Move beyond sector and theme allocation into hidden driver decomposition.

Target outputs:

- market beta
- growth vs value tilt
- momentum tilt
- size exposure
- quality tilt
- rate sensitivity
- commodity sensitivity where relevant
- custom thematic factors such as AI capex or semiconductor cycle exposure

This allows the system to explain what actually drives returns and drawdowns.

### 3. Look-Through Exposure Engine

Support indirect exposure analysis, especially for ETFs and overlapping wrappers.

Target outputs:

- ETF decomposition into top underlying holdings
- direct plus indirect exposure netting
- overlap detection across portfolios or sleeves
- concentration after look-through rather than surface allocation

This is one of the strongest differentiators because most portfolio tools stop at top-level holdings.

### 4. Causal Event Propagation

Instead of ranking events only by ticker mention, model how events propagate through connected entities.

Example pathways:

- rate shock -> long-duration growth -> software and fintech holdings
- TSMC disruption -> semiconductor supply chain -> chip designers and equipment names
- energy spike -> transport and industrial cost pressure -> downstream holdings

The system should show both the event and the path by which it matters.

### 5. Adversarial Scenario Generation

Go beyond predefined shock templates and generate structurally dangerous scenarios from the portfolio itself.

Target outputs:

- top 3 ways this portfolio breaks
- minimum shock set that causes a target drawdown
- hidden correlation cluster most likely to fail together
- sectors/themes that appear diversified but collapse under stress

This elevates the platform from analysis to portfolio defense tooling.

### 6. Command-Center Interface

Expose the system through a dense operational UI, not only isolated dashboard pages.

Target capabilities:

- live event rail
- synchronized graph, heatmap, and scenario views
- evidence panel for every AI claim
- time scrubber to replay how risk structure evolved around key events
- fast cross-filtering across holdings, themes, factors, and events

## Insane Mode Design Rules

If the advanced track is enabled, hold it to these standards:

- no black-box scores without decomposition
- no graph edge without a sourceable explanation
- no AI explanation without cited structured inputs
- no advanced scenario without a visible chain of assumptions
- no novelty feature that cannot support an institutional-style workflow

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

The project breaks into eight implementation workstreams:

1. Platform foundation
2. Portfolio and data ingestion
3. Quant analytics engine
4. Frontend dashboard and UX
5. Intelligence layer
6. Factor and look-through intelligence
7. Causal graph and scenario reasoning
8. Reliability, testing, and deployment

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

## Phase 4: Insane Mode

### Objective

Transform the product from a strong portfolio intelligence app into a market operating system centered on causal reasoning, hidden exposure decomposition, and structurally informed decision support.

### Scope

- factor intelligence layer
- look-through ETF and wrapper decomposition
- causal event propagation
- entity relationship expansion
- adversarial scenario generation
- command-center UI mode

### Backend Implementation

#### 1. Factor Intelligence Engine

Build:

- factor exposure schema and storage
- rolling factor loading calculations where data permits
- rules-based thematic factor definitions for MVP of this phase
- factor contribution outputs for return, risk, and scenario sensitivity

Required outputs:

- per-portfolio factor exposure summary
- per-holding factor linkage
- factor concentration alerts
- factor stability over time

Potential endpoint additions:

- `GET /portfolios/{portfolio_id}/factors`
- `GET /portfolios/{portfolio_id}/factor-history`

#### 2. Look-Through Exposure Engine

Build:

- ETF constituent ingestion
- recursive exposure flattening with depth controls
- direct plus indirect exposure aggregation
- overlap detection across holdings and wrappers

Required outputs:

- true top underlying names
- true sector and theme concentration after decomposition
- redundancy score across direct and indirect exposures

Potential endpoint additions:

- `GET /portfolios/{portfolio_id}/lookthrough`
- `GET /portfolios/{portfolio_id}/overlap`

#### 3. Entity Intelligence Layer

Expand the data model to include:

- suppliers
- customers
- competitors
- geographies
- macro factors
- benchmark or ETF entities

Required behavior:

- attach evidence metadata to each relationship
- distinguish curated links from inferred links
- support confidence scoring without hiding the underlying source

#### 4. Causal Event Propagation Engine

Build:

- event-to-entity linking
- entity-to-theme and entity-to-factor propagation logic
- path scoring based on exposure strength and relationship quality
- multi-hop reasoning with strict depth limits

Required outputs:

- ranked impact pathways
- event blast radius summary
- direct vs indirect impact separation

Potential endpoint additions:

- `GET /portfolios/{portfolio_id}/events/propagation`
- `GET /portfolios/{portfolio_id}/events/{event_id}/pathways`

#### 5. Adversarial Scenario Engine

Build:

- worst-cluster stress identification
- portfolio break analysis based on correlations, factors, and themes
- target-loss reverse stress testing
- scenario ranking by plausibility and severity

Required outputs:

- top structural vulnerabilities
- smallest scenario set that creates a target loss
- factors/themes/entities most responsible for break risk

Potential endpoint additions:

- `POST /portfolios/{portfolio_id}/scenarios/reverse-stress`
- `GET /portfolios/{portfolio_id}/vulnerabilities`

### Frontend Implementation

#### 1. Command-Center Mode

Build a flagship route or dashboard mode that combines:

- live event stream
- top vulnerabilities panel
- factor exposure panel
- synchronized relationship graph
- correlation and overlap heatmaps
- scenario launcher
- evidence drawer

This should feel like an operator console, not a standard SaaS dashboard.

#### 2. Factor Intelligence Views

Build:

- factor exposure cards
- rolling factor stability charts
- factor contribution breakdowns
- hidden-driver narrative panel grounded in structured outputs

#### 3. Look-Through and Overlap Views

Build:

- ETF decomposition explorer
- direct vs indirect exposure comparison
- redundancy map
- true concentration callouts after look-through analysis

#### 4. Event Propagation Views

Build:

- pathway explorer from event to holdings
- blast radius visualization
- direct vs indirect impact segmentation
- path evidence detail panel

#### 5. Reverse Stress and Vulnerability Views

Build:

- vulnerability leaderboard
- reverse stress setup form
- scenario explanation cards
- cluster failure explorer

### Data and Domain Tasks

- curate initial macro factor taxonomy
- curate initial supplier/customer/competitor relationship data for flagship demo names
- decide evidence model for graph edges and propagation paths
- define ETF decomposition strategy and vendor fallback plan
- define confidence labels for curated vs inferred relationships

### Testing Requirements

- tests for factor aggregation and normalization
- tests for recursive look-through decomposition
- tests for propagation path generation and depth controls
- tests for reverse stress scenario outputs
- tests for evidence attribution on graph edges and AI summaries

### Acceptance Criteria

- the system can explain hidden exposures beyond visible holdings
- the system can show how an event matters through a causal path, not just a mention match
- ETF wrappers can be decomposed into underlying concentration and overlap
- the platform can generate structurally dangerous scenarios from portfolio composition
- the command-center UI makes factors, events, graph edges, and scenarios inspectable in one workflow

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

Potential Phase 4 additions:

- `FactorDefinition`
- `FactorExposureSnapshot`
- `Entity`
- `EntityRelationship`
- `ETFConstituent`
- `EventPropagationPath`
- `ReverseStressRun`
- `OverlapSnapshot`

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

Then flagship components for Insane Mode:

- factor exposure matrix
- look-through explorer
- event pathway explorer
- vulnerability leaderboard
- evidence drawer
- command-center workspace panels

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

Insane Mode contracts:

- `FactorExposureResponse`
- `LookthroughExposureResponse`
- `EntityGraphResponse`
- `EventPropagationResponse`
- `ReverseStressResponse`
- `PortfolioVulnerabilityResponse`

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
- advanced views should always expose evidence, pathway, and decomposition without hiding behind novelty

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

### Risk: Insane Mode becomes incoherent scope inflation

Mitigation:

- keep flagship differentiators behind Phase 4 gates
- require each advanced feature to reuse Phase 1-3 primitives
- prioritize two or three signature workflows rather than many disconnected surfaces

### Risk: Causal reasoning looks impressive but is weakly grounded

Mitigation:

- separate curated relationships from inferred ones
- attach confidence and source metadata to every path
- expose the exact reasoning chain in UI and API responses

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
10. After MVP stability, select one flagship differentiator and build it deeply before adding the rest.

## Definition of Done For MVP

The MVP is done when:

- a new user can create a portfolio
- holdings can be entered manually or uploaded by CSV
- prices and benchmark history are fetched successfully
- portfolio performance and risk metrics are computed correctly
- the frontend renders overview, holdings, and risk views
- the AI layer produces grounded summaries without inventing numbers
- the system is coherent and useful before theme/event/graph/scenario work begins

## Definition of Done For Insane Mode

Insane Mode is done when:

- the platform can decompose visible and indirect exposures into a unified risk picture
- event relevance can be traced through explicit multi-entity pathways
- at least one reverse stress workflow identifies structural vulnerabilities from the portfolio itself
- the UI exposes evidence for graph edges, factor exposures, and scenario conclusions
- the product feels qualitatively different from a premium retail analytics app

## Recommended Flagship Build Order

Do not build all differentiators at once. Build them in this sequence:

1. Factor intelligence
2. Look-through exposure
3. Causal event propagation
4. Reverse stress and vulnerability engine
5. Command-center UI

Reasoning:

- factor and look-through outputs create the strongest hidden-exposure story
- event propagation becomes more credible once factor and entity data exist
- reverse stress becomes more interesting once graph and factor structure are available
- command-center mode is most effective once the underlying surfaces are already real

## Recommended Next Step

Start implementation with Phase 0 and the first half of Phase 1:

- scaffold project structure
- configure database and migrations
- implement portfolio ingestion
- implement market data service
- implement quant service with tests

That sequence creates the foundation the rest of the product depends on.

Once MVP is stable, the best first Insane Mode investment is factor intelligence plus look-through exposure. That pair creates the most defensible jump in product ambition without requiring the full causal graph stack on day one.
