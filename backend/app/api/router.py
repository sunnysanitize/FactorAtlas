from fastapi import APIRouter

from app.api.routes import ai, analytics, auth, events, graph, health, portfolios, scenarios

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(portfolios.router)
api_router.include_router(analytics.router)
api_router.include_router(events.router)
api_router.include_router(scenarios.router)
api_router.include_router(ai.router)
api_router.include_router(graph.router)
