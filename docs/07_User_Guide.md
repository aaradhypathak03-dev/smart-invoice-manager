# User Guide
## Smart Invoice Manager

This guide walks through each MVP screen and how to use it.

---

### 1. Vendor List
- View all vendors added so far.
- Click **Add Vendor** to create a new vendor (name required; email/phone/address optional).
- Vendors must exist before an invoice can be created against them.

---

### 2. Invoice List
- View all invoices in a table: Vendor, Invoice #, Invoice Date, Due Date, Total, Status.
- Overdue invoices are highlighted (e.g., red badge) automatically.
- Use the **filter bar** to narrow by vendor, payment status, overdue flag, or date range.
- Use the **search box** to find an invoice by number or vendor name.
- Click any row to open **Invoice Details**.

---

### 3. Add/Edit Invoice
- Select a **vendor** from the dropdown.
- Enter **invoice number** (must be unique for that vendor — you'll get an error if it's a duplicate).
- Enter **invoice date** and **due date**.
- Add one or more **line items**: description, quantity, unit price — subtotal calculates automatically.
- Enter **tax** — the **total amount** is calculated automatically (line items + tax) and cannot be typed manually.
- Save to create/update the invoice.

**Using AI Extraction instead of manual entry:**
- Click **Extract from Text/Image/PDF**.
- Paste invoice text, or upload an image/PDF.
- Review the auto-filled form carefully — AI extraction can make mistakes, especially on scanned documents.
- Edit any incorrect field, then click **Confirm & Save**. Nothing is saved until you confirm.

---

### 4. Invoice Details
- Read-only view of a single invoice: vendor info, all line items, dates, tax, total, and current payment status.
- Shows whether the invoice is Overdue.
- Update payment status here (Unpaid → Partially Paid → Paid), including amount paid.

---

### 5. Dashboard
- **Summary cards:** total outstanding amount, total overdue amount, number of overdue invoices.
- **Status breakdown chart:** Paid vs Unpaid vs Partially Paid totals.
- **Spend by vendor:** which vendors you've been billed the most by.
- **Recent invoices:** quick shortcut to the latest activity.

---

### 6. AI Extraction/Review Screen
- Reached from "Add/Edit Invoice" → "Extract from Text/Image/PDF".
- Shows extracted fields (vendor, invoice #, dates, tax, total, line items) in an editable form.
- You must review and confirm before the invoice is actually saved — this is a safety step, not optional.

---

### Tips
- An invoice's total is always system-calculated — you never enter it directly, to guarantee it matches the line items and tax (per business rules).
- The same invoice number can be reused across different vendors, but not twice for the same vendor.
