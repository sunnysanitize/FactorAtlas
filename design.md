# FactorAtlas

## Palantir-Inspired Portfolio Intelligence Platform

## Full Build Spec for Codex

## Overview

Build a full-stack web app for stock portfolio analysis that feels closer to a portfolio intelligence system than a retail stock tracker.

The product combines:

1. Market data ingestion
2. Quantitative finance analytics
3. News and event relevance
4. AI-generated explanations grounded in computed metrics
5. An interactive dashboard with graph-based relationship views

This should not be a chatbot wrapper with charts attached. The core of the product must be a real analytics engine.

## Product Goal

Help users understand:

- what their portfolio is actually exposed to
- where risk is concentrated
- which holdings are correlated
- which sectors and themes dominate the portfolio
- how current events may affect their positions
- how the portfolio behaves under stress scenarios

The app should convert raw holdings and market data into decision-ready insights.

## Core Product Thesis

Most portfolio apps only show:

- balances
- gains and losses
- simple allocation charts

This product should instead answer:

- Am I truly diversified?
- What hidden concentrations exist in my portfolio?
- Which holdings move together?
- What themes or macro drivers dominate my exposure?
- Which recent events are most relevant to my holdings?
- How vulnerable is my portfolio to different market scenarios?

## High-Level Architecture

The system has five layers:

1. Frontend dashboard
2. Backend API
3. Quantitative finance engine
4. Market and news ingestion layer
5. AI explanation layer

Conceptual flow:

- User inputs a portfolio
- Backend fetches market data and news
- Quant engine computes metrics and relationships
- AI layer explains those results
- Frontend renders an interactive intelligence dashboard

## Recommended Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts for standard charts
- react-force-graph or D3.js for network visualization

### Backend

- FastAPI in Python

### Quant / Data

- pandas
- numpy
- scipy
- statsmodels
- scikit-learn if needed later
- networkx for relationship graph construction

### Database

- PostgreSQL

### ORM / DB Layer

Choose one:

- SQLAlchemy + Alembic
- Prisma if the stack is centered on TypeScript

### AI

- Gemini API

### Market Data

For MVP:

- yfinance

Later optional upgrades:

- Alpha Vantage
- Polygon
- Twelve Data
- Finnhub

### News Data

For MVP use one:

- Finnhub news
- NewsAPI
- another stock/news API with article metadata

## Product Experience Goals

The app should feel:

- dark
- premium
- analytical
- institutional
- high-signal rather than flashy
- more like Palantir or Bloomberg than Robinhood

The UI should emphasize insight density, not gamified investing.

## Core Pages

### 1. Landing Page

Purpose:

- explain the product quickly
- show the value proposition
- establish the visual identity

Include:

- hero section
- one-sentence value proposition
- feature preview cards
- CTA to start or view demo

Suggested headline:
Understand what your portfolio is really exposed to.

Suggested subheadline:
A portfolio intelligence platform that combines quant analytics, event relevance, and AI explanations.

### 2. Portfolio Overview Page

Purpose:

- summarize the portfolio at a glance

Display:

- total portfolio value
- daily return
- cumulative return
- unrealized gain/loss
- number of holdings
- annualized volatility
- beta vs SPY
- max drawdown
- top holding
- top sector
- top theme

Visuals:

- portfolio value over time
- cumulative return chart
- allocation by holding
- allocation by sector
- allocation by theme

### 3. Holdings Page

Purpose:

- show detailed position-level information

Columns:

- ticker
- company name
- shares
- average cost
- current price
- market value
- weight in portfolio
- unrealized gain/loss
- daily move
- sector
- theme
- beta
- volatility contribution

Requirements:

- sorting
- filtering
- searching
- pagination if needed

### 4. Risk Page

Purpose:

- break down portfolio risk in a quant-focused way

Display:

- annualized volatility
- Sharpe ratio
- beta
- max drawdown
- Value at Risk
- concentration index
- top risk contributors
- rolling volatility
- rolling beta
- pairwise correlation heatmap

Visuals:

- risk contribution bar chart
- rolling metric charts
- heatmap of stock return correlations

### 5. Intelligence Graph Page

Purpose:

- provide a Palantir-style relationship view

This page should render an interactive network graph with node types such as:

- holdings
- sectors
- themes
- macro factors
- relevant news events

The graph should help the user understand:

- hidden thematic concentration
- correlated positions
- macro dependencies
- event relevance pathways

Requirements:

- zoom and pan
- click node for details
- hover edge for explanation
- highlight neighbors
- filter by node type
- filter by minimum edge weight

### 6. Scenario Analysis Page

Purpose:

- stress test the portfolio

Support predefined scenarios such as:

- SPY down 10 percent
- Tech down 8 percent
- Semiconductors down 12 percent
- AI infrastructure selloff
- Energy rally
- Rate shock

Display:

- estimated portfolio impact
- impact by holding
- impact by sector
- impact by theme
- largest vulnerabilities
- largest resilient positions

### 7. News / Event Intelligence Page

Purpose:

- connect recent events to the user’s holdings

Display:

- recent news events ranked by relevance to the portfolio
- affected tickers
- event category
- AI-generated explanation of why the event matters

This page should not just dump headlines. It should rank and explain relevance.

### 8. AI Copilot Page

Purpose:

- let the user ask natural-language questions about the portfolio

Example questions:

- What are my biggest risks?
- Am I actually diversified?
- Which positions drive most of my volatility?
- What happens if semiconductors sell off?
- What themes dominate my portfolio?
- Which recent news matters most?

AI responses must be grounded in structured backend outputs.

## Core Entities / Data Model

### User

Fields:

- id
- email
- created_at
- updated_at

### Portfolio

Fields:

- id
- user_id
- name
- created_at
- updated_at

### Holding

Fields:

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

### PriceHistory

Fields:

- id
- ticker
- date
- open
- high
- low
- close
- adjusted_close
- volume

### PortfolioSnapshot

Fields:

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

### NewsEvent

Fields:

- id
- title
- source
- published_at
- summary
- url
- event_category
- raw_text_optional

### EventHoldingRelevance

Fields:

- id
- event_id
- ticker
- relevance_score
- explanation

### Scenario

Fields:

- id
- portfolio_id
- name
- scenario_type
- parameters_json
- created_at

## Portfolio Input Methods

Support at least two methods.

### Manual Entry

User enters:

- ticker
- shares
- average cost

Backend enriches:

- company name
- sector
- theme

### CSV Upload

Required columns:

- ticker
- shares
- average_cost

Optional columns:

- company_name
- sector
- notes

Behavior:

- validate schema
- normalize ticker casing
- handle duplicates
- enrich missing metadata

## Backend Service Structure

Recommended services:

- `portfolio_service.py`
- `market_data_service.py`
- `quant_service.py`
- `theme_service.py`
- `graph_service.py`
- `news_service.py`
- `scenario_service.py`
- `ai_service.py`

Each service should be modular and independently testable.

## Market Data Ingestion Layer

Purpose:

- fetch current and historical data for each holding
- fetch benchmark data for analytics

For each ticker fetch:

- company name
- sector if available
- current price
- historical daily price data

Also fetch:

- SPY historical data as benchmark

Use adjusted close prices for return calculations.

Recommended functions:

- `fetch_ticker_metadata(ticker)`
- `fetch_current_price(ticker)`
- `fetch_price_history(ticker, start_date, end_date)`
- `fetch_benchmark_history(start_date, end_date)`

MVP source:

- yfinance

Implementation notes:

- cache results when possible
- centralize normalization
- avoid duplicate API calls

## News / Event Ingestion Layer

Purpose:

- gather recent events relevant to the portfolio

Requirements:

- fetch recent articles per ticker
- store title, source, URL, timestamp, summary
- classify each event
- rank relevance to current holdings

Suggested event categories:

- earnings
- macro
- regulation
- product launch
- guidance
- analyst action
- supply chain
- geopolitics
- rates and inflation

Pipeline:

1. Fetch raw articles
2. Deduplicate by URL and title
3. Clean the content
4. Summarize the article into a short event summary
5. Associate event with tickers
6. Compute relevance score
7. Store structured results

## Quantitative Finance Engine

This is the core of the product. Implement real calculations. Do not let AI fabricate quant results.

### Required Metrics

#### 1. Portfolio Value

For each holding:

- market value = shares x current price

Portfolio total:

- sum of market values

#### 2. Historical Portfolio Returns

Use adjusted close returns per holding.

For each day:

- compute daily return of each holding
- weight by portfolio weight
- sum weighted returns to get portfolio return

Store:

- daily return series
- cumulative return series

#### 3. Annualized Volatility

Formula:

- standard deviation of daily portfolio returns multiplied by square root of 252

#### 4. Beta vs SPY

Formula:

- covariance(portfolio_returns, spy_returns) divided by variance(spy_returns)

#### 5. Sharpe Ratio

Formula:

- (annualized portfolio return minus risk free rate) divided by annualized volatility

For MVP:

- use a fixed risk-free rate constant or config value

#### 6. Max Drawdown

Use cumulative return curve:

- compute running peak
- compute percent drop from peak
- take minimum value

#### 7. Concentration Metrics

Implement:

- largest holding weight
- top 3 combined weight
- Herfindahl-Hirschman Index of portfolio weights

#### 8. Correlation Matrix

Compute pairwise correlation of holding daily returns.

Use in:

- heatmap
- graph relationships
- hidden concentration analysis

#### 9. Risk Contribution by Position

MVP method:

- use weight x volatility or a covariance-adjusted approximation

Return:

- per-holding contribution score
- ranked list of main risk drivers

#### 10. Historical Value at Risk

Implement one-day historical VaR at 95 percent:

- use empirical 5th percentile of historical portfolio daily returns

Optional:

- CVaR / expected shortfall later

#### 11. Rolling Metrics

Implement rolling:

- volatility
- beta
- Sharpe if possible

These are useful for charts and AI commentary.

## Theme and Exposure Engine

Purpose:

- show hidden concentration that sector labels alone miss

Each holding should belong to:

- one sector
- one or more themes

Example themes:

- AI infrastructure
- semiconductors
- big tech
- cloud
- cybersecurity
- defense
- energy
- consumer discretionary
- fintech
- healthcare innovation

MVP approach:

- maintain a curated JSON mapping of ticker to sector and themes
- enrich missing values when metadata is available

Outputs:

- portfolio weight by sector
- portfolio weight by theme
- top themes
- theme concentration scores

Key idea:
A user may appear diversified across tickers while still being heavily concentrated in one theme.

## Relationship Graph Engine

Purpose:

- generate structured graph data for frontend rendering

### Node Types

Support at least:

- holding
- sector
- theme
- macro_factor
- event

### Edge Types

Support at least:

- belongs_to_sector
- belongs_to_theme
- correlated_with
- impacted_by_event
- linked_to_macro
- event_related_to_theme

### Edge Requirements

Each edge should include:

- source
- target
- type
- weight
- explanation

Example relationship logic:

- holding to sector if the stock belongs to that sector
- holding to theme for mapped themes
- holding to holding if correlation exceeds a threshold
- event to holding if the event is relevant
- macro factor to theme if the factor commonly impacts that theme

### Graph JSON Shape

Return something like:

```json
{
  "nodes": [
    {
      "id": "NVDA",
      "label": "NVDA",
      "type": "holding",
      "size": 18
    },
    {
      "id": "Semiconductors",
      "label": "Semiconductors",
      "type": "theme",
      "size": 24
    }
  ],
  "edges": [
    {
      "source": "NVDA",
      "target": "Semiconductors",
      "type": "belongs_to_theme",
      "weight": 1.0,
      "explanation": "NVDA is classified under the semiconductors theme."
    }
  ]
}
```

## Scenario Engine

Purpose:

- estimate how the portfolio behaves under hypothetical shocks

### MVP Scenario Types

Support scenarios such as:

- benchmark shock
- sector shock
- theme shock
- single-stock shock
- custom manual shocks

### Example Scenarios

- SPY down 10 percent
- Tech sector down 8 percent
- Semiconductors down 12 percent
- AI infrastructure down 15 percent
- Energy up 10 percent

### MVP Calculation Method

For each scenario:

- identify affected holdings by sector, theme, or ticker
- apply scenario shock directly to those holdings
- recompute portfolio impact
- aggregate total and component effects

Return:

- total estimated portfolio move
- estimated move by holding
- estimated move by sector
- estimated move by theme

Future improvements:

- factor propagation
- correlation spillover
- regime-aware scenarios

## AI Layer Design

Purpose:

- explain computed portfolio analytics in plain English
- answer natural-language questions using grounded data

Important rule:
AI must never invent quant outputs.

The AI layer must consume structured inputs from the backend such as:

- top holdings
- weights
- sector breakdown
- theme breakdown
- annualized volatility
- beta
- Sharpe ratio
- max drawdown
- VaR
- top correlations
- relevant events
- scenario results

Then it may generate:

- portfolio summaries
- risk explanations
- diversification analysis
- event relevance explanations
- scenario interpretations

## AI Grounding Rules

Every Gemini prompt should include:

- exact portfolio metrics
- exact exposure breakdowns
- exact top relationships
- exact event summaries
- exact scenario outputs

Prompt instructions should explicitly say:

- do not invent numbers
- do not claim uncertainty as certainty
- only interpret the supplied analytics
- mention when evidence is weak or incomplete
- prefer concise, decision-focused language

## Example AI Use Cases

### Portfolio Summary

Prompt intent:
Summarize the portfolio’s main risk characteristics, concentration, and dominant themes.

### Diversification Check

Prompt intent:
Explain whether the portfolio is diversified across holdings, sectors, themes, and correlations.

### Event Relevance

Prompt intent:
Explain why these recent news events matter for the current portfolio.

### Scenario Interpretation

Prompt intent:
Interpret what this stress test says about the portfolio’s vulnerabilities.

### Copilot Q&A

Prompt intent:
Answer user questions using only structured analytics and event data.

## Backend API Endpoints

Suggested endpoints:

### Portfolio Management

- `POST /portfolios`
- `GET /portfolios`
- `GET /portfolios/{portfolio_id}`
- `POST /portfolios/{portfolio_id}/holdings`
- `POST /portfolios/{portfolio_id}/upload-csv`

### Market Data

- `GET /portfolios/{portfolio_id}/history`
- `GET /portfolios/{portfolio_id}/prices`

### Quant Analytics

- `GET /portfolios/{portfolio_id}/overview`
- `GET /portfolios/{portfolio_id}/risk`
- `GET /portfolios/{portfolio_id}/correlations`
- `GET /portfolios/{portfolio_id}/themes`
- `GET /portfolios/{portfolio_id}/graph`

### Events

- `GET /portfolios/{portfolio_id}/events`

### Scenarios

- `POST /portfolios/{portfolio_id}/scenarios/run`
- `GET /portfolios/{portfolio_id}/scenarios`

### AI

- `POST /portfolios/{portfolio_id}/copilot`

## Frontend Component Plan

### Layout Components

- sidebar
- top nav
- KPI card
- section header
- filter controls

### Charts

- portfolio performance line chart
- cumulative return chart
- holdings allocation donut chart
- sector allocation bar chart
- theme allocation bar chart
- rolling volatility chart
- rolling beta chart
- risk contribution bar chart
- correlation heatmap

### Tables

- holdings table
- event table
- scenario results table

### Intelligence Components

- relationship graph panel
- AI summary card
- event relevance card
- concentration alert card
- scenario impact card

## Suggested Frontend Routes

Use a structure like:

- `/`
- `/dashboard`
- `/portfolio/[id]`
- `/portfolio/[id]/holdings`
- `/portfolio/[id]/risk`
- `/portfolio/[id]/graph`
- `/portfolio/[id]/scenarios`
- `/portfolio/[id]/events`
- `/portfolio/[id]/copilot`

## Suggested File Structure

### Frontend

```text
frontend/
  app/
    page.tsx
    dashboard/
    portfolio/
      [id]/
        page.tsx
        holdings/
        risk/
        graph/
        scenarios/
        events/
        copilot/
  components/
    layout/
    charts/
    tables/
    cards/
    graph/
  lib/
    api.ts
    types.ts
    format.ts
```

### Backend

```text
backend/
  app/
    main.py
    api/
      routes/
        portfolios.py
        analytics.py
        events.py
        scenarios.py
        ai.py
    services/
      portfolio_service.py
      market_data_service.py
      quant_service.py
      theme_service.py
      graph_service.py
      news_service.py
      scenario_service.py
      ai_service.py
    models/
    schemas/
    utils/
```

## Implementation Phases

### Phase 1: MVP

Codex should first implement:

- portfolio creation
- manual holdings entry
- CSV upload
- market data ingestion
- overview page
- holdings page
- core quant metrics
- risk page basics
- allocation charts
- correlation heatmap
- AI portfolio summary

This should already be fully usable.

### Phase 2: Intelligence Layer

Then add:

- theme engine
- event ingestion
- event relevance ranking
- intelligence graph
- scenario analysis page

### Phase 3: Advanced Quant Layer

Then add:

- Value at Risk
- rolling beta
- rolling volatility
- risk contribution refinement
- better scenario modeling

Optional after that:

- optimization
- Monte Carlo simulation
- regime detection

## Engineering Priorities

Codex should prioritize in this order:

1. clean data model
2. holdings and portfolio ingestion
3. price history pipeline
4. core quant engine
5. overview and holdings UI
6. risk analytics UI
7. AI explanation layer
8. theme engine
9. relationship graph
10. event intelligence
11. scenario engine

## Non-Negotiable Product Rules

- Do not build a generic LLM wrapper
- Do not rely on AI for numeric finance calculations
- Do not make the graph decorative only
- Do not overcomplicate the first version
- Keep the architecture modular
- Every AI output must be grounded in real computed results
- The product should feel analytical from the first usable version

## Definition of Success

The project is successful if a user can:

- upload or create a portfolio
- see real quantitative portfolio metrics
- understand their concentrations and correlations
- explore thematic and event relationships
- run scenario stress tests
- ask questions and receive grounded AI answers
- feel like they are using a portfolio intelligence platform rather than a simple tracker

## Final Product Definition

A Palantir-inspired portfolio intelligence platform that combines market data, quant analytics, event relevance, and grounded AI explanations to reveal the real structure, risks, and drivers of a stock portfolio.

## Direct Instructions for Codex

Implement this as a production-style full-stack project with:

- a modular FastAPI backend
- a typed Next.js frontend
- a quant engine in Python
- reusable chart and graph components
- a premium dark dashboard UI
- Gemini used only for explanation and Q&A grounded in computed analytics

Build the MVP first. Make each layer fully functional before adding the next.
