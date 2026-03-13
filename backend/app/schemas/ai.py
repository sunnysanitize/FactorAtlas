from pydantic import BaseModel


class CopilotRequest(BaseModel):
    question: str
    context_type: str = "general"  # "general", "risk", "diversification", "events", "scenario"


class CopilotResponse(BaseModel):
    answer: str
    source_metrics: dict | None = None
    confidence: str = "medium"  # "high", "medium", "low"
