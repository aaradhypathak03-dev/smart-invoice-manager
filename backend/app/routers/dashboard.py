from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from app.database import get_db
from app.models.invoice import Invoice, PaymentStatus
from app.models.vendor import Vendor
from app.services.invoice_rules import compute_subtotal, compute_tax_amount, is_overdue
from app.services.invoice_presenter import to_invoice_list_item
from app.schemas.invoice import InvoiceListItemOut
from app.services.auth_deps import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])


class StatusBreakdown(BaseModel):
    paid: int = 0
    partially_paid: int = 0
    unpaid: int = 0
    overdue: int = 0


class DashboardSummary(BaseModel):
    total_outstanding: float
    overdue_amount: float
    overdue_count: int
    status_breakdown: StatusBreakdown


class VendorSpend(BaseModel):
    vendor_id: int
    vendor_name: str
    total: float


def _all_invoices(db: Session) -> list[Invoice]:
    return (
        db.execute(select(Invoice).options(joinedload(Invoice.vendor), joinedload(Invoice.items)))
        .unique()
        .scalars()
        .all()
    )


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    invoices = _all_invoices(db)

    total_outstanding = 0.0
    overdue_amount = 0.0
    overdue_count = 0
    breakdown = StatusBreakdown()

    for inv in invoices:
        subtotal = compute_subtotal(inv.items)
        total = subtotal + compute_tax_amount(subtotal, inv.tax_percent)
        outstanding = total - float(inv.amount_paid)
        overdue = is_overdue(inv.due_date, inv.payment_status)

        if inv.payment_status != PaymentStatus.paid:
            total_outstanding += outstanding

        if overdue:
            overdue_amount += outstanding
            overdue_count += 1
            breakdown.overdue += 1
        elif inv.payment_status == PaymentStatus.paid:
            breakdown.paid += 1
        elif inv.payment_status == PaymentStatus.partially_paid:
            breakdown.partially_paid += 1
        else:
            breakdown.unpaid += 1

    return DashboardSummary(
        total_outstanding=total_outstanding,
        overdue_amount=overdue_amount,
        overdue_count=overdue_count,
        status_breakdown=breakdown,
    )


@router.get("/spend-by-vendor", response_model=list[VendorSpend])
def spend_by_vendor(db: Session = Depends(get_db)):
    vendors = db.execute(select(Vendor)).scalars().all()
    invoices = _all_invoices(db)

    totals: dict[int, float] = {}
    for inv in invoices:
        subtotal = compute_subtotal(inv.items)
        total = subtotal + compute_tax_amount(subtotal, inv.tax_percent)
        totals[inv.vendor_id] = totals.get(inv.vendor_id, 0) + total

    result = [
        VendorSpend(vendor_id=v.id, vendor_name=v.name, total=totals.get(v.id, 0))
        for v in vendors
        if totals.get(v.id, 0) > 0
    ]
    return sorted(result, key=lambda v: v.total, reverse=True)


@router.get("/recent-invoices", response_model=list[InvoiceListItemOut])
def recent_invoices(db: Session = Depends(get_db), limit: int = 5):
    invoices = (
        db.execute(
            select(Invoice)
            .options(joinedload(Invoice.vendor), joinedload(Invoice.items))
            .order_by(Invoice.created_at.desc())
            .limit(limit)
        )
        .unique()
        .scalars()
        .all()
    )
    return [to_invoice_list_item(inv) for inv in invoices]
