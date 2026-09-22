"""Centralized business rules for invoices (BR-1 to BR-3).

Kept isolated from routers so the rules are the single place to change when
requirements shift (per docs/02_System_Architecture_and_Flow.md).
"""

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.invoice import Invoice, PaymentStatus
from app.models.invoice_item import InvoiceItem


class DuplicateInvoiceNumberError(HTTPException):
    def __init__(self, invoice_number: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "DUPLICATE_INVOICE_NUMBER",
                "message": f'Invoice number "{invoice_number}" already exists for this vendor',
            },
        )


def ensure_unique_invoice_number(
    db: Session, vendor_id: int, invoice_number: str, exclude_invoice_id: int | None = None
) -> None:
    """BR-1: invoice number must be unique per vendor."""
    query = select(Invoice).where(
        Invoice.vendor_id == vendor_id,
        Invoice.invoice_number == invoice_number,
    )
    if exclude_invoice_id is not None:
        query = query.where(Invoice.id != exclude_invoice_id)
    if db.execute(query).scalar_one_or_none() is not None:
        raise DuplicateInvoiceNumberError(invoice_number)


def compute_subtotal(items: list[InvoiceItem]) -> float:
    return sum(float(item.quantity) * float(item.unit_price) for item in items)


def compute_tax_amount(subtotal: float, tax_percent: float) -> float:
    return subtotal * (float(tax_percent) / 100)


def compute_total(items: list[InvoiceItem], tax_percent: float) -> float:
    """BR-2: total = sum(line items) + tax, tax applied as % of subtotal."""
    subtotal = compute_subtotal(items)
    return subtotal + compute_tax_amount(subtotal, tax_percent)


def is_overdue(due_date: date, payment_status: PaymentStatus, today: date | None = None) -> bool:
    """BR-3: overdue = unpaid/partially paid AND due date has passed."""
    if payment_status == PaymentStatus.paid:
        return False
    return due_date < (today or date.today())
