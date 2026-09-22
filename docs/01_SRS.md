# Software Requirements Specification (SRS)
## Smart Invoice Manager

### 1. Introduction

#### 1.1 Purpose
This document specifies the functional and non-functional requirements for the Smart Invoice Manager — an application that helps businesses maintain vendor and invoice information, track payment status, identify overdue invoices, and understand spending patterns.

#### 1.2 Scope
The system requires account registration (name, phone number, password) and login. Once authenticated, a user can:
- Manage vendors
- Create and manage invoices with line items
- Track payment status per invoice
- Search and filter invoices
- View invoice details
- View aggregate invoice statistics (dashboard)
- Optionally extract invoice data from text/image/PDF using AI, with mandatory human review before saving

#### 1.3 Out of Scope
- Actual payment processing
- Accounting software integration
- GST filing
- Bank integration
- Automated email processing

---

### 2. Functional Requirements

| ID | Requirement |
|---|---|
| FR-0a | User can register with name, phone number, and password |
| FR-0b | User can log in with phone number + password |
| FR-1 | User can add a vendor (name + optional contact details) |
| FR-2 | User can view a list of all vendors |
| FR-3 | User can create an invoice against a vendor |
| FR-4 | User can add one or more line items to an invoice (description, quantity, unit price) |
| FR-5 | System records invoice number, invoice date, and due date |
| FR-6 | System records tax and computes total amount from line items + tax |
| FR-7 | User can set/update payment status: Unpaid / Partially Paid / Paid |
| FR-8 | User can search/filter invoices by vendor, status, date range, and overdue flag |
| FR-9 | User can view full invoice details (vendor, items, dates, amounts, status) |
| FR-10 | User can view dashboard statistics (totals, overdue count, spend by vendor, etc.) |
| FR-11 | (Optional/AI) User can submit invoice text/image/PDF for AI-based field extraction |
| FR-12 | (Optional/AI) Extracted data is shown on a review screen for verification/edit before saving |

---

### 3. Business Rules

| ID | Rule |
|---|---|
| BR-1 | Invoice number must be unique **per vendor** (not globally unique) |
| BR-2 | Total amount must correspond to the sum of line items (qty × unit price) plus tax, where tax is entered as a percentage applied to the invoice subtotal (not a flat amount) |
| BR-3 | An invoice is **Overdue** if due date < current date AND status ≠ Paid |
| BR-4 | Paid invoices must be visually/programmatically distinguishable from unpaid/partially paid invoices |
| BR-5 | AI-extracted data is never saved directly — it must pass through user review/confirmation |

---

### 4. Data Entities (Minimum)

- **Vendor**
- **Invoice**
- **Invoice Item**
- **Payment Status** (enum on Invoice: `Unpaid`, `Partially Paid`, `Paid`)

Full field-level design is in [04_Database_Design.md](./04_Database_Design.md).

---

### 5. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Application should run locally with a single setup command per service (Docker Compose for DB) |
| NFR-2 | API responses for standard CRUD operations should return within ~500ms under normal local load |
| NFR-3 | AI extraction results must always be reviewable/editable — never silently auto-saved |
| NFR-4 | System should handle at least 3 concurrent users for demo purposes (no formal load target) |
| NFR-5 | Codebase should be modular enough to absorb a live requirement change (see Phase 4) without a full rewrite |

---

### 6. Assumptions & Constraints

- Single-tenant system; no authentication/authorization in MVP.
- Currency is single/implicit (not multi-currency) unless changed by a later requirement.
- AI extraction accuracy is best-effort; human verification is the safety net, not the AI itself.
