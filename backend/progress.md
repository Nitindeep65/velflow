# Backend Progress - AI Contract Navigator

## Project Overview
AI-powered contract analysis tool for small agency owners, freelancers, and SaaS founders.

## Status Legend
- [x] Completed
- [ ] Not Started
- [~] In Progress

---

## Week 1: Foundations

### Project Setup
- [x] FastAPI project initialized
- [x] Project structure (routers, models, services, utils)
- [x] Dependency management (requirements.txt)
- [x] Environment configuration (.env)
- [x] Logging setup

### Database Setup
- [x] Database selection (SQLite for local setup)
- [x] Connection pooling & Thread support
- [x] Basic CRUD utilities & SQLAlchemy models
- [x] Auto-initialize tables (`Base.metadata.create_all`)

### File Upload & Storage
- [x] File upload endpoint (`POST /api/contracts/upload`)
- [x] Secure file storage (local `uploads/` directory)
- [x] File type validation (PDF, DOCX)
- [x] File size limits & clean names

---

## Week 2: Extraction & Storage

### Text Extraction
- [x] PDF text extraction (`pypdf` Reader)
- [x] DOCX text extraction (`python-docx` Paragraph compiler)
- [x] Text cleaning & truncation

### Database Schema
- [x] Users table
- [x] Contracts table (name, counterparty, type, status, risk, next_date, file_path, owner_id)
- [x] Rich JSON columns (`summary_points`, `risks`, `dates_timeline`, `details_extracted`)

### API Endpoints
- [x] POST /api/contracts/upload
- [x] GET /api/contracts/{id}
- [x] DELETE /api/contracts/{id}
- [x] GET /api/contracts (list with search and skip filters)
- [x] GET /api/contracts/{id}/file (blob download proxy)

---

## Week 3: Clause Classification & Risk Radar

### LLM Integration
- [x] LLM client setup (OpenAI wrapper referencing NVIDIA NIM base url)
- [x] Prompt engineering for metadata extraction
- [x] Context limits and token considerations
- [x] Error handling fallback defaults

### Clause Processing
- [x] AI-based classification of Counterparty, Type, Risk level
- [x] Parameter extraction (summary points, key warnings)
- [x] Risk severity tagging (High, Medium, Low)

### Risk Radar API
- [x] GET /api/contracts/{id} (returns risk value)
- [x] POST /api/contracts/{id}/reanalyze (triggers fresh deep extraction)

---

## Week 4: Semantic Q&A

### RAG Pipeline
- [x] Text indexing on the fly
- [x] Context assembly for legal questions
- [x] Answer generation with guidelines restricting hallucinations

### Q&A API
- [x] POST /api/contracts/{id}/chat (returns markdown legal answers)

---

## Week 5: Comparison View

### Contract Comparison Logic
- [x] Version comparison prompt (Base vs. New contracts comparison)
- [x] Category analysis (Term, Termination, Liability, Payment, Governing Law)
- [x] Status detection (Unchanged / Modified)
- [x] Excerpt clause alignment diff generation (old text vs. new text snippets)

### Comparison API
- [x] POST /api/contracts/compare (accepts base_id and compare_id query params)

---

## Week 6: Polish, Reminders & User Tests

### Date Extraction & Seeding
- [x] Key date extraction timeline (ID, title, date, badge type, active, description)
- [x] Seeding endpoint `POST /api/contracts/seed` to load mock v1/v2 comparison templates
- [x] PUT /api/contracts/{id}/dates endpoint to update toggled states or custom milestones

### Authentication & Authorization
- [x] User authentication (JWT tokens, password hashing via bcrypt)
- [x] Session verification dependency (`get_current_user`)
- [x] Stale token auto-invalidation intercepts returning HTTP 401
- [x] CORS middleware enabling cross-origin browser integration

---

## Notes
- Logged all NIM completions.
- Ensured SQLite concurrency checks (`check_same_thread=False`).
- Maintained clear legal disclaimer warning in details footer.
