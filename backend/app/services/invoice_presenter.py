from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceOut, InvoiceListItemOut, InvoiceItemOut
from app.services.invoice_rules import compute_subtotal, compute_tax_amount, is_overdue


def to_invoice_out(invoice: Invoice) -> InvoiceOut:
    subtotal = compute_subtotal(invoice.items)
    tax_amount = compute_tax_amount(subtotal, invoice.tax_percent)
    return InvoiceOut(
        id=invoice.id,
        vendor_id=invoice.vendor_id,
        invoice_number=invoice.invoice_number,
        invoice_date=invoice.invoice_date,
        due_date=invoice.due_date,
        tax_percent=float(invoice.tax_percent),
        payment_status=invoice.payment_status,
        amount_paid=float(invoice.amount_paid),
        subtotal=subtotal,
        tax_amount=tax_amount,
        total_amount=subtotal + tax_amount,
        is_overdue=is_overdue(invoice.due_date, invoice.payment_status),
        created_at=invoice.created_at,
        updated_at=invoice.updated_at,
        vendor=invoice.vendor,
        items=[
            InvoiceItemOut(
                id=item.id,
                description=item.description,
                quantity=float(item.quantity),
                unit_price=float(item.unit_price),
                line_total=item.line_total,
            )
            for item in invoice.items
        ],
    )


def to_invoice_list_item(invoice: Invoice) -> InvoiceListItemOut:
    subtotal = compute_subtotal(invoice.items)
    tax_amount = compute_tax_amount(subtotal, invoice.tax_percent)
    return InvoiceListItemOut(
        id=invoice.id,
        vendor_id=invoice.vendor_id,
        vendor_name=invoice.vendor.name,
        invoice_number=invoice.invoice_number,
        invoice_date=invoice.invoice_date,
        due_date=invoice.due_date,
        total_amount=subtotal + tax_amount,
        payment_status=invoice.payment_status,
        is_overdue=is_overdue(invoice.due_date, invoice.payment_status),
    )
