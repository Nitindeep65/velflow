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

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "LexiCLM API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
