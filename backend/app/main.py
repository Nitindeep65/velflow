from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers.auth import router as auth_router
from app.routers.contracts import router as contracts_router
from app.routers.crm import router as crm_router
from app.routers.playbook import router as playbook_router
from app.routers.webhook import router as webhook_router

# Auto-initialize database tables (simplifies local setup with SQLite)
Base.metadata.create_all(bind=engine)

# Safeguard to add columns to contracts table if they are missing in SQLite
from sqlalchemy import text
with engine.connect() as conn:
    # Check if counterparty_id column exists, if not add it
    try:
        conn.execute(text("SELECT counterparty_id FROM contracts LIMIT 1"))
    except Exception:
        try:
            conn.execute(text("ALTER TABLE contracts ADD COLUMN counterparty_id INTEGER"))
            conn.commit()
            print("Successfully added counterparty_id column to contracts table.")
        except Exception as e:
            print("Could not add counterparty_id column:", e)

    # Check if pipeline_id column exists, if not add it
    try:
        conn.execute(text("SELECT pipeline_id FROM contracts LIMIT 1"))
    except Exception:
        try:
            conn.execute(text("ALTER TABLE contracts ADD COLUMN pipeline_id INTEGER"))
            conn.commit()
            print("Successfully added pipeline_id column to contracts table.")
        except Exception as e:
            print("Could not add pipeline_id column:", e)

app = FastAPI(
    title="LexiCLM AI Contract Navigator API",
    description="Backend API service for contract risk analysis, text extraction, and Q&A.",
    version="1.0.0"
)

# Strip Vercel's service route prefix from the path if present
@app.middleware("http")
async def clean_vercel_prefix(request, call_next):
    path = request.scope.get("path", "")
    if path.startswith("/_/backend"):
        request.scope["path"] = path[len("/_/backend"):]
    response = await call_next(request)
    return response

# Configure CORS to permit local frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(contracts_router)
app.include_router(crm_router)
app.include_router(playbook_router)
app.include_router(webhook_router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "LexiCLM API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
