import time
from typing import Any

from app.core.config import settings


class TTLCache:
    def __init__(self, ttl: int | None = None):
        self._store: dict[str, tuple[float, Any]] = {}
        self._ttl = ttl or settings.CACHE_TTL_SECONDS

    def get(self, key: str) -> Any | None:
        if key in self._store:
            ts, value = self._store[key]
            if time.time() - ts < self._ttl:
                return value
            del self._store[key]
        return None

    def set(self, key: str, value: Any) -> None:
        self._store[key] = (time.time(), value)

    def clear(self) -> None:
        self._store.clear()


price_cache = TTLCache()
metadata_cache = TTLCache(ttl=3600)
