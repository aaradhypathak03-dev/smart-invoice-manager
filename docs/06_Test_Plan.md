# Test Plan
## Smart Invoice Manager

### 1. Objective
Verify that all functional requirements and business rules (BR-1 to BR-5) work correctly, and that the system remains stable after the live requirement-change task.

---

### 2. Test Levels

| Level | Tool | Scope |
|---|---|---|
| Unit Testing | Pytest | Service-layer functions: total calculation, overdue logic, uniqueness check |
| API Testing | Pytest + httpx / Postman | Every endpoint — happy path + validation errors |
| AI Extraction Testing | Manual + sample files | Accuracy of extraction across text/image/PDF inputs |
| UI/Functional Testing | Manual walkthrough | All 6 MVP screens, end-to-end user flows |
| Regression Testing | Re-run above after each change | Especially after the live requirement-change task |

---

### 3. Key Test Cases

#### Vendor Module
| ID | Case | Expected Result |
|---|---|---|
| TC-V1 | Add vendor with valid name | Vendor created, appears in list |
| TC-V2 | Add vendor with missing name | Validation error |

#### Invoice Module
| ID | Case | Expected Result |
|---|---|---|
| TC-I1 | Create invoice with valid line items + tax | Total = sum(line items) + tax |
| TC-I2 | Create invoice with duplicate invoice number for same vendor | Rejected (BR-1) |
| TC-I3 | Create invoice with same invoice number but different vendor | Allowed (BR-1 is per-vendor) |
| TC-I4 | Edit invoice line items | Total recalculates automatically |
| TC-I5 | Create invoice with due date in the past | Saved, but flagged Overdue if unpaid |

#### Payment Status Module
| ID | Case | Expected Result |
|---|---|---|
| TC-P1 | Mark invoice as Paid | Status badge updates, excluded from overdue list |
| TC-P2 | Partially pay an invoice | Status = Partially Paid, amount_paid reflected |
| TC-P3 | Unpaid invoice past due date | Marked Overdue automatically |
| TC-P4 | Paid invoice past due date | NOT marked Overdue (BR-3) |

#### Search & Filter
| ID | Case | Expected Result |
|---|---|---|
| TC-S1 | Filter by vendor | Only that vendor's invoices shown |
| TC-S2 | Filter by overdue = true | Only overdue invoices shown |
| TC-S3 | Filter by date range | Only invoices within range shown |

#### Dashboard
| ID | Case | Expected Result |
|---|---|---|
| TC-D1 | Dashboard totals | Match sum of underlying invoice data |
| TC-D2 | Overdue count | Matches count from filtered overdue list |

#### AI Extraction
| ID | Case | Expected Result |
|---|---|---|
| TC-A1 | Extract from clean text invoice | Fields correctly populated in review form |
| TC-A2 | Extract from scanned image invoice | Fields populated, minor inaccuracies acceptable — user can edit |
| TC-A3 | Extract from PDF | PDF rasterized and processed without error |
| TC-A4 | Save extracted data without edits | Goes through same validation as manual entry (BR-1, BR-2 still enforced) |

---

### 4. Bug Tracking
Log defects with: ID, module, steps to reproduce, expected vs actual, severity. Fix and re-test before moving to next phase.

---

### 5. Regression Checklist (post requirement-change task)
- [ ] All existing endpoints still respond correctly
- [ ] Existing business rules (BR-1 to BR-5) still hold unless explicitly changed by the new requirement
- [ ] New requirement's change is verified with at least one new test case
- [ ] No UI screen broken by schema/API change
