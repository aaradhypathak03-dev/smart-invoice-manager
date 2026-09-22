# Module & Submodule Description
## Smart Invoice Manager

Each module below maps to a backend router + service + frontend page(s). Kept short by design — details live in code/API docs.

---

### 1. Vendor Module
Manages vendor master data referenced by invoices.

| Submodule | Description |
|---|---|
| Add Vendor | Create a new vendor with name and optional contact info (email, phone, address) |
| Vendor List | View all vendors, used as a selector when creating invoices and as a filter option |
| Edit Vendor | Update vendor details |

---

### 2. Invoice Module
Core module — creation and management of invoices.

| Submodule | Description |
|---|---|
| Create Invoice | Select vendor, enter invoice number, invoice date, due date, tax |
| Line Items | Add/remove/edit line items (description, quantity, unit price); subtotal computed per line |
| Total Calculation | Auto-computed total = sum(line item subtotals) + tax (BR-2); not manually editable |
| Uniqueness Validation | Enforces invoice number unique per vendor (BR-1) at save time |
| Edit Invoice | Modify an existing invoice (line items, dates, tax) before/after payment |
| Invoice List | Paginated list of all invoices with key columns (vendor, number, date, due date, total, status) |
| Invoice Details | Full read-only view of one invoice — vendor info, all line items, dates, tax, total, status, overdue flag |

---

### 3. Payment Status Module
Tracks and visualizes payment lifecycle of an invoice.

| Submodule | Description |
|---|---|
| Status Update | Change invoice status: Unpaid → Partially Paid → Paid |
| Overdue Detection | Computed rule: unpaid/partially-paid + due date passed = Overdue (BR-3) |
| Status Badges | Visual distinction (color-coded) between Paid, Unpaid, Partially Paid, Overdue (BR-4) |

---

### 4. Search & Filter Module
Helps locate invoices quickly across a growing dataset.

| Submodule | Description |
|---|---|
| Filter by Vendor | Show only invoices for a selected vendor |
| Filter by Status | Show Unpaid / Partially Paid / Paid invoices |
| Filter by Overdue | Show only overdue invoices |
| Filter by Date Range | Show invoices within an invoice-date or due-date range |
| Search | Free-text search by invoice number or vendor name |

---

### 5. Dashboard Module
Aggregate view of invoice/spending data.

| Submodule | Description |
|---|---|
| Summary Cards | Total outstanding amount, total overdue amount, count of overdue invoices |
| Status Breakdown | Paid vs Unpaid vs Partially Paid totals (chart) |
| Spend by Vendor | Top vendors by total invoiced amount |
| Recent Invoices | Quick list of most recently created/updated invoices |

---

### 6. AI Extraction Module *(optional capability)*
Extracts structured invoice data from unstructured input for faster data entry.

| Submodule | Description |
|---|---|
| Input Intake | Accepts pasted text, uploaded image, or PDF |
| AI Extraction Call | Sends content to the Google Gemini API (reads images and PDFs natively) with a structured-output schema requesting vendor, invoice number, dates, tax amount, total amount, line items |
| Review Screen | Displays extracted fields in an editable form — nothing is saved until user confirms |
| Confirm & Save | On confirmation, reuses the standard Invoice creation flow/validation (same as manual entry) |

---

### 7. Shared/Cross-Cutting

| Submodule | Description |
|---|---|
| Services Layer | Centralized business rules (uniqueness, total calc, overdue logic) shared by all routers — the main "change absorption point" for the live requirement-change task |
| API Client (Frontend) | Single typed layer for all HTTP calls to backend, used by every page |
| Error Handling | Consistent validation error format surfaced to the UI (e.g., duplicate invoice number, missing required fields) |
