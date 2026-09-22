# Requirement Change Log
## Smart Invoice Manager

Tracks live requirement changes handled during the hackathon (Phase 4 of the project plan: Change Intake → Impact Analysis → Rapid Implementation → Regression Check → Re-documentation).

---

## CR-01: AI-Assisted Invoice Data Extraction (Mid-Hackathon Change Request)

**Received:** 2.5 hours after hackathon start | **Time budget:** ~2 hours

### 4.1 Change Intake
The judges' change request asked for AI extraction of invoice data from text or an image/document, covering: vendor name, invoice number, invoice date, due date, **tax amount**, **total amount**, and line items — displayed in an editable form, with the AI never allowed to save data directly.

### 4.2 Impact Analysis
The AI Extraction module already existed from the original build (text/image/PDF → OpenAI vision → review screen → save via the standard invoice-creation endpoint). Gap found against the exact spec:
- Extraction previously returned `tax_percent` (a rate), not the raw `tax_amount` / `total_amount` values the request asked for.
- No cross-check between the AI's stated total and the app's own computed total (an explicit "Validation" evaluation point).
- Missing/undetected fields were silently left blank instead of being flagged to the user (an explicit "Handling missing/incorrect information" evaluation point).

Affected modules: `backend/app/ai/extraction.py` (extraction schema/prompt), `backend/app/routers/ai.py` (error handling), `frontend/src/pages/AiExtract.tsx` (review screen), `frontend/src/api/client.ts` (types). Core invoice model (`tax_percent`-based, BR-2) was **not** changed — the AI module still funnels into the same validated creation endpoint.

### 4.3 Implementation
- `ExtractedInvoice` schema changed from `tax_percent` to `tax_amount` + `total_amount` (matching what's actually printed on an invoice).
- Frontend review screen now:
  - Converts the AI's `tax_amount` into an editable `Tax %` field (since the core invoice model is percentage-based), defaulting from the extracted value.
  - Shows the AI's stated total next to the app's own computed total, with a warning banner if they disagree by more than ~1% — the computed total is always what actually gets saved (keeps BR-2 intact).
  - Marks any field the AI couldn't find (vendor, invoice #, dates, line items) with a "Not detected" flag and a highlighted input, requiring the user to fill it in before saving.
- Fixed a pre-existing bug found during this change: an OpenAI API error (e.g. invalid key) was leaking as an unhandled 500 instead of a clean error — now returns 503 with a readable message.

### 4.4 Regression Check
- Backend imports cleanly; OpenAPI schema confirmed to expose `tax_amount`/`total_amount`.
- Confirmed the AI router now returns a clean 503 (not a 500) when OpenAI auth fails.
- Confirmed the "never auto-save" rule is unchanged — extraction still only returns a draft; saving still goes through the same `POST /invoices` with BR-1/BR-2 enforced.
- Frontend type-checks cleanly; existing manual invoice creation flow untouched.

### 4.5 Re-documentation
- `01_SRS.md`, `05_API_Documentation.md` already described the AI module generically — no changes needed there.
- This file added as the change log entry.
