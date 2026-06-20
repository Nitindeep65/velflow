# AI Contract Navigator

**AI-powered contract analysis for small business owners, freelancers, and SaaS founders.**

---

## What It Is

AI Contract Navigator is an intelligent tool that reads, analyzes, and explains legal contracts in plain English. It helps non-lawyers understand what they're signing, identify risky clauses, and compare contract versions—saving time, money, and legal headaches.

---

## The Problem

Small business owners and freelancers frequently deal with contracts (client agreements, SaaS subscriptions, NDAs) but:
- **Can't afford lawyers** for every contract review ($200-500/hour)
- **Don't understand legal jargon** and miss important details
- **Miss critical dates** like renewal deadlines and notice periods
- **Struggle to compare versions** when contracts are revised
- **Sign risky clauses** (auto-renewals, unlimited liability, unfair termination terms)

---

## The Solution

Upload any contract (PDF or DOCX) and the AI instantly:

| Feature | What It Does |
|---------|--------------|
| **Risk Radar** | Highlights dangerous clauses with severity scores (1-5) |
| **Smart Q&A** | Ask questions in plain English, get answers with citations |
| **Version Compare** | See exactly what changed between contract versions |
| **Date Tracking** | Extracts renewal dates, notice deadlines, sends reminders |

**Target Users:**
- Agency owners reviewing client contracts
- Freelancers evaluating project agreements  
- SaaS founders reviewing vendor/subscription agreements
- Small business owners managing multiple contracts

---

## Key Differentiators

- **Focused scope:** Built specifically for B2B contracts (SaaS, services, NDAs)
- **Risk-first:** Surfaces problematic clauses immediately, not just summarizes
- **Actionable insights:** Extracts key dates, terms, and obligations
- **Comparison made easy:** Side-by-side diff for contract negotiations
- **Privacy-first:** Secure file handling with encryption

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python) |
| **Database** | PostgreSQL + pgvector for semantic search |
| **AI/LLM** | OpenAI/Anthropic for analysis and Q&A |
| **File Processing** | PyPDF2, python-docx for text extraction |
| **Vector Search** | Embeddings + similarity matching for Q&A |

---

## Project Structure

```
velflow.dev/
├── frontend/          # Next.js application
│   ├── app/          # Pages and layouts
│   ├── components/   # Reusable UI components
│   └── progress.md   # Frontend development tracker
├── backend/          # FastAPI application
│   ├── routers/      # API endpoints
│   ├── models/       # Database models
│   ├── services/     # Business logic
│   └── progress.md   # Backend development tracker
└── docs/             # Specifications and planning
```

---

## Development Timeline

**6-Week MVP Sprint:**

1. **Week 1:** Project setup, file upload, basic extraction
2. **Week 2:** Database design, text extraction, storage
3. **Week 3:** Clause classification, Risk Radar v1
4. **Week 4:** Vector search, semantic Q&A (RAG)
5. **Week 5:** Contract comparison, diff generation
6. **Week 6:** Date reminders, polish, user testing

---

## Important Notes

- ⚖️ **Not Legal Advice:** This tool is an assistant, not a lawyer. All outputs include legal disclaimers.
- 🔒 **Privacy First:** Contracts contain sensitive data—encryption at rest and in transit.
- 🤖 **AI Limitations:** AI can misinterpret clauses; UI shows raw text for user verification.

---

## Getting Started

See individual progress files for detailed implementation status:
- [Frontend Progress](./frontend/progress.md)
- [Backend Progress](./backend/progress.md)
