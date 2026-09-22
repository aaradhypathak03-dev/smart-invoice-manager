# Smart Invoice Manager

An invoice management application for businesses to add vendors, create and track invoices, manage payment status, search/filter invoices, and view spending statistics — with optional AI-based extraction of invoice data from text, images, or PDFs.

Built for **Hackathon Problem Statement 4: Smart Invoice Manager**.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Database | PostgreSQL (via Docker Compose) |
| ORM / Migrations | SQLAlchemy + Alembic |
| Frontend | React (Vite + TypeScript) + Tailwind CSS |
| AI Extraction | Google Gemini API (text / image / PDF, free tier) |
| Auth | JWT (phone + password) |

## Project Documentation

All project documents are in [`/docs`](./docs):

| Document | Purpose |
|---|---|
| [01_SRS.md](./docs/01_SRS.md) | Software Requirements Specification |
| [02_System_Architecture_and_Flow.md](./docs/02_System_Architecture_and_Flow.md) | Architecture & flow diagrams with explanation |
| [03_Module_Description.md](./docs/03_Module_Description.md) | Module & submodule breakdown |
| [04_Database_Design.md](./docs/04_Database_Design.md) | ER diagram & schema |
| [05_API_Documentation.md](./docs/05_API_Documentation.md) | API endpoint reference |
| [06_Test_Plan.md](./docs/06_Test_Plan.md) | Test strategy & test cases |
| [07_User_Guide.md](./docs/07_User_Guide.md) | Screen-by-screen usage guide |
| [08_Change_Requests.md](./docs/08_Change_Requests.md) | Log of mid-hackathon requirement changes and how they were handled |

## Project Structure

```
hackethon/
├── backend/              # FastAPI app
│   ├── app/
│   │   ├── models/        # SQLAlchemy models (Vendor, Invoice, InvoiceItem)
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── routers/       # API routes per module (vendors, invoices, dashboard, ai)
│   │   ├── services/      # Business rules (uniqueness, totals, overdue) + presenters
│   │   └── ai/             # AI extraction (Google Gemini, reads images/PDFs natively)
│   ├── alembic/            # DB migrations
│   ├── docker-compose.yml  # Postgres
│   ├── requirements.txt
│   └── .env.example
├── frontend/              # React + Vite + TS app
│   └── src/
│       ├── pages/          # Vendor list, Invoice list, Add/Edit, Details, Dashboard, AI Review
│       ├── components/     # Shared UI (Button, Card, StatusBadge, Layout)
│       ├── store/           # Shared app state (frontend-only; will move to API client)
│       └── types/           # Domain types + calculation helpers
├── UI_REFERENCE.md        # Internal UI/design reference
└── docs/                  # Project documentation
```

## Setup & Run

**Backend:**
```bash
cd backend
docker compose up -d                 # starts Postgres on localhost:5432
python -m venv venv
./venv/Scripts/pip install -r requirements.txt   # (Linux/Mac: venv/bin/pip)
cp .env.example .env                 # set GEMINI_API_KEY, JWT_SECRET_KEY
./venv/Scripts/python -m alembic upgrade head    # apply DB schema
./venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```
API runs at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`. You'll land on `/login` — register a new account first (name, phone, password — no OTP/verification step).

## Out of Scope

- Actual payment processing
- Accounting software integration
- GST filing
- Bank integration
- Automated email processing
