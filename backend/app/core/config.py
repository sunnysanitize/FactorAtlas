from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_ENV: str = "development"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/factoratlas"
    AI_PROVIDER: str = "openrouter"
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "openrouter/free"
    NEWS_API_KEY: str = ""
    FINNHUB_API_KEY: str = ""
    RISK_FREE_RATE: float = 0.05
    CACHE_TTL_SECONDS: int = 300


settings = Settings()
