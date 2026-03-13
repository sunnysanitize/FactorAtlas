from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(
    title="FactorAtlas - Portfolio Intelligence Platform",
    description="A portfolio intelligence platform combining quant analytics, event relevance, and AI explanations.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
