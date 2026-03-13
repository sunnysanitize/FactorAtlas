# FactorAtlas Frontend

Next.js frontend for FactorAtlas, the portfolio intelligence platform.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- react-force-graph

## Run Locally

1. Create the frontend env file:

```bash
cp .env.local.example .env.local
```

2. Install dependencies:

```bash
npm install
```

3. Start the dev server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## API Base URL

Default local API target:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

The frontend expects the backend API to be running.

## Current Scope

The frontend currently includes:

- landing page
- dashboard
- portfolio overview
- holdings page
- risk page
- graph page
- scenarios page
- events page
- copilot page

Some views are still scaffold-level and depend on backend/API completeness.
