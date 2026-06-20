from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers.auth import router as auth_router
from app.routers.contracts import router as contracts_router

# Auto-initialize database tables (simplifies local setup with SQLite)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LexiCLM AI Contract Navigator API",
    description="Backend API service for contract risk analysis, text extraction, and Q&A.",
    version="1.0.0"
)

# Configure CORS to permit frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(contracts_router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "LexiCLM API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
