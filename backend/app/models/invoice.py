import enum
from datetime import date, datetime

from sqlalchemy import String, Date, DateTime, Numeric, Enum, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PaymentStatus(str, enum.Enum):
    unpaid = "unpaid"
    partially_paid = "partially_paid"
    paid = "paid"


class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__ = (UniqueConstraint("vendor_id", "invoice_number", name="uq_invoice_number_per_vendor"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    invoice_number: Mapped[str] = mapped_column(String(100), nullable=False)
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    tax_percent: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status"), default=PaymentStatus.unpaid, nullable=False
    )
    amount_paid: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    vendor: Mapped["Vendor"] = relationship(back_populates="invoices")
    items: Mapped[list["InvoiceItem"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan", order_by="InvoiceItem.id"
    )
