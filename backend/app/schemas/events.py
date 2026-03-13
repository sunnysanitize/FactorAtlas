import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EventRelevanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ticker: str
    relevance_score: float
    explanation: str | None


class NewsEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    source: str | None
    published_at: datetime | None
    summary: str | None
    url: str | None
    event_category: str | None
    affected_holdings: list[EventRelevanceResponse] = []


class EventsListResponse(BaseModel):
    events: list[NewsEventResponse]
    total: int


class EventPathwayResponse(BaseModel):
    path_type: str
    holding: str
    via: list[str]
    impact_score: float
    explanation: str


class EventPropagationItemResponse(BaseModel):
    event_id: str
    title: str
    event_category: str | None
    direct_count: int
    indirect_count: int
    blast_radius_score: float
    pathways: list[EventPathwayResponse]


class EventPropagationResponse(BaseModel):
    events: list[EventPropagationItemResponse]
