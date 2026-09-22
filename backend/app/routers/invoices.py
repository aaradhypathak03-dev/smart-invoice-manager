from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.invoice import Invoice, PaymentStatus
from app.models.invoice_item import InvoiceItem
from app.models.vendor import Vendor
from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceStatusUpdate,
    InvoiceOut,
    InvoiceListItemOut,
)
from app.services.invoice_rules import ensure_unique_invoice_number, is_overdue
from app.services.invoice_presenter import to_invoice_out, to_invoice_list_item
from app.services.auth_deps import get_current_user

router = APIRouter(prefix="/api/invoices", tags=["invoices"], dependencies=[Depends(get_current_user)])


def _get_invoice_or_404(db: Session, invoice_id: int) -> Invoice:
    invoice = db.execute(
        select(Invoice)
        .options(joinedload(Invoice.vendor), joinedload(Invoice.items))
        .where(Invoice.id == invoice_id)
    ).unique().scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.post("", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db)):
    if not db.get(Vendor, payload.vendor_id):
        raise HTTPException(status_code=404, detail="Vendor not found")

    ensure_unique_invoice_number(db, payload.vendor_id, payload.invoice_number)

    invoice = Invoice(
        vendor_id=payload.vendor_id,
        invoice_number=payload.invoice_number,
        invoice_date=payload.invoice_date,
        due_date=payload.due_date,
        tax_percent=payload.tax_percent,
        items=[InvoiceItem(**item.model_dump()) for item in payload.items],
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return to_invoice_out(_get_invoice_or_404(db, invoice.id))


@router.get("", response_model=list[InvoiceListItemOut])
def list_invoices(
    db: Session = Depends(get_db),
    vendor_id: int | None = None,
    status_filter: PaymentStatus | None = Query(default=None, alias="status"),
    overdue: bool | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    search: str | None = None,
):
    query = select(Invoice).options(joinedload(Invoice.vendor), joinedload(Invoice.items))

    if vendor_id is not None:
        query = query.where(Invoice.vendor_id == vendor_id)
    if status_filter is not None:
        query = query.where(Invoice.payment_status == status_filter)
    if from_date is not None:
        query = query.where(Invoice.invoice_date >= from_date)
    if to_date is not None:
        query = query.where(Invoice.invoice_date <= to_date)
    if search:
        like = f"%{search}%"
        query = query.join(Vendor).where(or_(Invoice.invoice_number.ilike(like), Vendor.name.ilike(like)))

    invoices = db.execute(query.order_by(Invoice.invoice_date.desc())).unique().scalars().all()

    if overdue is not None:
        invoices = [inv for inv in invoices if is_overdue(inv.due_date, inv.payment_status) == overdue]

    return [to_invoice_list_item(inv) for inv in invoices]


@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    return to_invoice_out(_get_invoice_or_404(db, invoice_id))


@router.put("/{invoice_id}", response_model=InvoiceOut)
def update_invoice(invoice_id: int, payload: InvoiceUpdate, db: Session = Depends(get_db)):
    invoice = _get_invoice_or_404(db, invoice_id)
    ensure_unique_invoice_number(db, payload.vendor_id, payload.invoice_number, exclude_invoice_id=invoice_id)

    invoice.vendor_id = payload.vendor_id
    invoice.invoice_number = payload.invoice_number
    invoice.invoice_date = payload.invoice_date
    invoice.due_date = payload.due_date
    invoice.tax_percent = payload.tax_percent
    invoice.items.clear()
    invoice.items.extend(InvoiceItem(**item.model_dump()) for item in payload.items)

    db.commit()
    return to_invoice_out(_get_invoice_or_404(db, invoice_id))


@router.patch("/{invoice_id}/status", response_model=InvoiceOut)
def update_invoice_status(invoice_id: int, payload: InvoiceStatusUpdate, db: Session = Depends(get_db)):
    invoice = _get_invoice_or_404(db, invoice_id)
    invoice.payment_status = payload.payment_status
    invoice.amount_paid = payload.amount_paid
    db.commit()
    return to_invoice_out(_get_invoice_or_404(db, invoice_id))


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = _get_invoice_or_404(db, invoice_id)
    db.delete(invoice)
    db.commit()
