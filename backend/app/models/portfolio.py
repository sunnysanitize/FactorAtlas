import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class Portfolio(BaseModel):
    __tablename__ = "portfolios"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    user: Mapped["User"] = relationship(back_populates="portfolios")  # noqa: F821
    holdings: Mapped[list["Holding"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")  # noqa: F821
    snapshots: Mapped[list["PortfolioSnapshot"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")  # noqa: F821
    scenarios: Mapped[list["Scenario"]] = relationship(back_populates="portfolio", cascade="all, delete-orphan")  # noqa: F821
