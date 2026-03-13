# FactorAtlas System Architecture

## Objective

Define a production-style architecture for the portfolio intelligence platform that supports:

- a clean MVP
- modular analytics services
- grounded AI interpretation
- future expansion into factor intelligence, causal graph reasoning, and reverse stress workflows

The architecture should preserve one core rule:

numeric truth comes from deterministic computation, not from the LLM layer.

## Architecture Summary

The platform consists of five primary layers:

1. Frontend application
2. Backend API layer
3. Analytics and intelligence services
4. Data persistence and cache
5. External data and AI providers

## High-Level System Flow

### Core MVP Flow

1. User creates a portfolio and adds holdings.
2. Backend validates and stores holdings.
3. Market data service fetches ticker metadata, prices, and SPY benchmark history.
4. Quant service computes portfolio metrics and risk outputs.
5. Backend exposes typed responses to frontend.
6. Frontend renders dashboard, holdings, and risk surfaces.
7. AI service receives structured analytics payloads and returns grounded explanations.

### Intelligence Flow

1. Theme service maps holdings to sectors and themes.
2. News service ingests, deduplicates, and scores events.
3. Graph service builds nodes and edges across holdings, themes, sectors, macro factors, and events.
4. Scenario service applies structured shocks and returns impacts.
5. Frontend renders graph, events, and scenarios.

### Insane Mode Flow

1. Factor service computes hidden exposure decomposition.
2. Look-through service expands ETFs and wrappers into underlying exposure.
3. Entity service manages suppliers, customers, competitors, and macro links.
4. Propagation service computes event impact pathways through the graph.
5. Reverse stress logic identifies structural vulnerabilities and break scenarios.
6. Command-center UI synchronizes these outputs into one analytical workflow.

## Layer Breakdown

## 1. Frontend Layer

### Responsibilities

- portfolio creation and file upload UX
- dashboard rendering
- charts, tables, and graph interactions
- scenario controls
- AI copilot display
- command-center coordination in later phases

### Architectural Constraints

- frontend should not compute core finance metrics
- frontend may derive UI-only transformations such as sorting or formatting
- all critical analytics should come from backend contracts

### Key Frontend Modules

- route-level pages
- API client layer
- shared types
- chart components
- graph components
- command-center workspace components

## 2. Backend API Layer

### Responsibilities

- request validation
- auth integration later if added
- orchestration across services
- response shaping for frontend consumption
- exposing typed analytics and intelligence endpoints

### Design Pattern

Use thin route handlers and push logic into services.

Routes should:

- validate inputs
- load dependencies
- call services
- return typed schemas

Routes should not:

- contain quant logic
- contain enrichment logic
- build graph relationships inline
- call the LLM directly without service mediation

## 3. Analytics and Intelligence Services

This is the core of the system.

### `portfolio_service.py`

Responsibilities:

- create and retrieve portfolios
- add and update holdings
- normalize holding input
- merge duplicate positions

Inputs:

- manual holding payloads
- CSV upload payloads

Outputs:

- canonical holdings records
- portfolio summaries for CRUD operations

### `market_data_service.py`

Responsibilities:

- fetch ticker metadata
- fetch current prices
- fetch adjusted close history
- fetch benchmark data
- normalize vendor outputs
- cache repeated requests

Inputs:

- ticker list
- date range

Outputs:

- normalized metadata
- normalized time series

### `quant_service.py`

Responsibilities:

- compute portfolio value
- compute returns and cumulative series
- compute volatility, beta, Sharpe, and drawdown
- compute concentration and correlations
- compute risk contribution
- compute VaR and rolling metrics in later phases

Inputs:

- holdings
- current prices
- historical price series
- benchmark history
- configuration such as risk-free rate

Outputs:

- overview metrics
- risk metrics
- chart-ready time series
- correlation matrices

### `theme_service.py`

Responsibilities:

- map holdings to sectors and themes
- aggregate portfolio exposure by sector and theme
- compute concentration by theme

Inputs:

- holdings
- curated mapping data
- vendor metadata where available

Outputs:

- sector exposure
- theme exposure
- enriched holding labels

### `news_service.py`

Responsibilities:

- fetch recent articles
- normalize article data
- deduplicate by URL/title
- summarize event content
- classify event category
- score relevance to holdings

Inputs:

- portfolio tickers
- provider API responses

Outputs:

- `NewsEvent` records
- relevance-ranked event payloads

### `graph_service.py`

Responsibilities:

- generate graph nodes and edges
- encode relationship types and explanations
- apply graph thresholds and filters

Inputs:

- holdings
- theme outputs
- correlation outputs
- event relevance outputs
- entity relationships in Insane Mode

Outputs:

- graph JSON payload

### `scenario_service.py`

Responsibilities:

- run predefined and custom shock scenarios
- calculate impact by holding, sector, and theme
- persist scenario runs if desired
- support reverse stress in Insane Mode

Inputs:

- portfolio state
- theme/sector mappings
- scenario definitions

Outputs:

- scenario result payloads
- vulnerability outputs in later phases

### `ai_service.py`

Responsibilities:

- construct grounded prompts
- pass exact analytics/event/scenario inputs to Gemini
- enforce no-invention rules
- return concise portfolio explanations

Inputs:

- structured analytics payloads
- relevant event data
- scenario results

Outputs:

- natural-language explanation payloads

### `factor_service.py`

Phase 4 responsibilities:

- compute factor exposure summaries
- track exposure history
- map holdings to factor taxonomy
- estimate factor-driven portfolio vulnerabilities

### `lookthrough_service.py`

Phase 4 responsibilities:

- ingest ETF constituents
- expand wrapper exposure recursively
- aggregate direct and indirect concentration
- compute overlap and redundancy

### `entity_service.py`

Phase 4 responsibilities:

- manage non-holding entities such as suppliers, customers, competitors, and geographies
- track evidence and confidence metadata for entity relationships

### `propagation_service.py`

Phase 4 responsibilities:

- compute event pathways through entities, themes, and factors
- separate direct impact from indirect impact
- attach score, explanation, and evidence to each path

## 4. Data Persistence Layer

### Primary Database

Use PostgreSQL for durable storage of:

- users
- portfolios
- holdings
- snapshots
- events
- scenario definitions and results
- factors and entities in later phases

### Cache Layer

For MVP, a simple in-process or DB-backed caching approach is acceptable.

Later, if needed, add a dedicated cache layer for:

- market data fetch results
- benchmark history
- event query results
- precomputed analytics payloads

### Persistence Strategy

Persist canonical business data.

Examples:

- portfolios and holdings
- fetched or normalized event records
- scenario runs if useful for history

Do not over-persist derived analytics too early unless performance requires it.

## 5. External Integrations

### Market Data Provider

MVP:

- yfinance

Future:

- Polygon
- Finnhub
- Twelve Data
- Alpha Vantage

### News Provider

MVP:

- Finnhub or NewsAPI

### AI Provider

- Gemini API

### Integration Guardrails

- wrap each provider behind a service boundary
- normalize vendor responses before downstream use
- never let vendor response shapes leak deeply into domain logic

## Data Model Overview

## Core MVP Models

### `User`

- id
- email
- created_at
- updated_at

### `Portfolio`

- id
- user_id
- name
- created_at
- updated_at

### `Holding`

- id
- portfolio_id
- ticker
- company_name
- shares
- average_cost
- sector
- primary_theme
- created_at
- updated_at

### `PriceHistory`

- id
- ticker
- date
- open
- high
- low
- close
- adjusted_close
- volume

### `PortfolioSnapshot`

- id
- portfolio_id
- date
- total_value
- daily_return
- cumulative_return
- annualized_volatility
- beta
- sharpe_ratio
- max_drawdown

## Phase 2 Models

### `NewsEvent`

- id
- title
- source
- published_at
- summary
- url
- event_category

### `EventHoldingRelevance`

- id
- event_id
- ticker
- relevance_score
- explanation

### `Scenario`

- id
- portfolio_id
- name
- scenario_type
- parameters_json
- created_at

## Phase 4 Models

### `Entity`

- id
- entity_type
- name
- external_ref

### `EntityRelationship`

- id
- source_entity_id
- target_entity_id
- relationship_type
- weight
- evidence_json
- confidence

### `FactorDefinition`

- id
- code
- name
- factor_type
- methodology_json

### `FactorExposureSnapshot`

- id
- portfolio_id
- factor_definition_id
- as_of_date
- exposure_value
- contribution_value

### `ETFConstituent`

- id
- parent_ticker
- constituent_ticker
- weight
- as_of_date

## API Architecture

## MVP Routes

- `POST /portfolios`
- `GET /portfolios`
- `GET /portfolios/{portfolio_id}`
- `POST /portfolios/{portfolio_id}/holdings`
- `POST /portfolios/{portfolio_id}/upload-csv`
- `GET /portfolios/{portfolio_id}/history`
- `GET /portfolios/{portfolio_id}/prices`
- `GET /portfolios/{portfolio_id}/overview`
- `GET /portfolios/{portfolio_id}/risk`
- `GET /portfolios/{portfolio_id}/correlations`
- `POST /portfolios/{portfolio_id}/copilot`

## Intelligence Routes

- `GET /portfolios/{portfolio_id}/themes`
- `GET /portfolios/{portfolio_id}/events`
- `GET /portfolios/{portfolio_id}/graph`
- `POST /portfolios/{portfolio_id}/scenarios/run`
- `GET /portfolios/{portfolio_id}/scenarios`

## Insane Mode Routes

- `GET /portfolios/{portfolio_id}/factors`
- `GET /portfolios/{portfolio_id}/factor-history`
- `GET /portfolios/{portfolio_id}/lookthrough`
- `GET /portfolios/{portfolio_id}/overlap`
- `GET /portfolios/{portfolio_id}/events/propagation`
- `GET /portfolios/{portfolio_id}/events/{event_id}/pathways`
- `POST /portfolios/{portfolio_id}/scenarios/reverse-stress`
- `GET /portfolios/{portfolio_id}/vulnerabilities`

## API Response Design Principles

- include raw values and pre-aggregated summaries
- include explanation metadata where relationships exist
- include timestamps and freshness markers where external data is involved
- keep chart payloads frontend-friendly
- keep advanced payloads decomposable rather than opaque

## Graph Architecture

## Node Types

- holding
- sector
- theme
- macro_factor
- event
- entity
- ETF

## Edge Types

- belongs_to_sector
- belongs_to_theme
- correlated_with
- impacted_by_event
- linked_to_macro
- event_related_to_theme
- supplier_to
- customer_of
- competitor_to
- contains_constituent

## Graph Rules

- every edge must carry `type`, `weight`, and `explanation`
- edges should be filterable by type and threshold
- inferred edges should carry confidence
- curated and inferred edges should be distinguishable

## AI Grounding Architecture

The LLM is a downstream interpreter, not an analytical engine.

### Allowed Inputs

- exact metrics from quant service
- exact exposure breakdowns from theme/factor services
- exact scenario outputs from scenario service
- exact event summaries and rankings from news service
- exact graph relationships when explanation is requested

### Disallowed Behavior

- inventing performance statistics
- inferring unsupported causal relationships
- presenting weak signals as certain facts
- producing recommendations without structured support

### Prompt Construction Pattern

Each prompt should include:

- portfolio summary payload
- risk payload
- relevant exposures
- event or scenario data if applicable
- explicit instruction to only interpret supplied data

## Reliability and Performance

## MVP Performance Approach

- synchronous data fetches are acceptable
- cache expensive market data requests
- avoid duplicate historical fetches
- precompute chart-friendly structures in backend

## Later Performance Improvements

- background refresh jobs
- analytics snapshotting
- smarter invalidation of price and event caches
- asynchronous ingestion for large portfolios

## Security and Trust

### MVP

- basic input validation
- secret management through env vars
- defensive error handling

### Later

- user auth
- per-user access control
- audit logging for scenario runs and copilot usage
- rate limiting for expensive endpoints

## Observability

Add minimal observability early:

- request logging
- service error logging
- provider failure logging

Later add:

- endpoint latency metrics
- cache hit/miss metrics
- analytics computation timing
- scenario execution timing

## Key Architectural Risks

### Risk: Service boundaries blur

Mitigation:

- route handlers stay thin
- provider logic stays in provider-facing services
- quant logic stays isolated and testable

### Risk: AI gets treated as a shortcut for hard logic

Mitigation:

- only call AI after structured analytics are available
- require prompts to include explicit metrics payloads
- expose evidence in the UI

### Risk: The graph becomes untrustworthy

Mitigation:

- require explanation fields
- attach evidence and confidence to advanced relationships
- separate curated edges from inferred edges

### Risk: Insane Mode creates architectural sprawl

Mitigation:

- treat factor, look-through, entity, and propagation logic as distinct services
- add advanced models only when their phase begins
- prioritize one flagship differentiator at a time

## Recommended Architecture Sequence

1. Implement portfolio, market data, and quant services first.
2. Expose stable overview, risk, and correlation contracts.
3. Build the core frontend around those contracts.
4. Add AI as a strict interpretation layer.
5. Add themes, events, graph, and scenarios.
6. Add factors and look-through exposure.
7. Add entity reasoning, propagation, and reverse stress.
8. Unify advanced outputs in command-center mode.
