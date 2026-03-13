#!/bin/sh
set -eu

python -c "from app.db.base import Base; import app.models; from app.db.session import engine; Base.metadata.create_all(bind=engine)"

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
