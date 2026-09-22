from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.invoice import PaymentStatus
from app.schemas.vendor import VendorOut


class InvoiceItemBase(BaseModel):
    description: str
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0)


class InvoiceItemCreate(InvoiceItemBase):
    pass


class InvoiceItemOut(InvoiceItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    line_total: float


class InvoiceBase(BaseModel):
    vendor_id: int
    invoice_number: str
    invoice_date: date
    due_date: date
    tax_percent: float = Field(default=0, ge=0, le=100)


class InvoiceCreate(InvoiceBase):
    items: list[InvoiceItemCreate] = Field(min_length=1)


class InvoiceUpdate(InvoiceBase):
    items: list[InvoiceItemCreate] = Field(min_length=1)


class InvoiceStatusUpdate(BaseModel):
    payment_status: PaymentStatus
    amount_paid: float = Field(ge=0)


class InvoiceOut(InvoiceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    payment_status: PaymentStatus
    amount_paid: float
    subtotal: float
    tax_amount: float
    total_amount: float
    is_overdue: bool
    created_at: datetime
    updated_at: datetime
    vendor: VendorOut
    items: list[InvoiceItemOut]


class InvoiceListItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vendor_id: int
    vendor_name: str
    invoice_number: str
    invoice_date: date
    due_date: date
    total_amount: float
    payment_status: PaymentStatus
    is_overdue: bool
