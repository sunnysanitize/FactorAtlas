from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # "holding", "sector", "theme", "macro_factor", "event"
    size: float = 10.0
    metadata: dict | None = None


class GraphEdge(BaseModel):
    source: str
    target: str
    type: str  # "belongs_to_sector", "belongs_to_theme", "correlated_with", etc.
    weight: float = 1.0
    explanation: str | None = None


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
