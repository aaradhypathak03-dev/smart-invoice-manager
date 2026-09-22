export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid'

export interface Vendor {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}

export interface InvoiceItem {
  id: number
  description: string
  quantity: number
  unit_price: number
  line_total: number
}

export interface InvoiceItemInput {
  description: string
  quantity: number
  unit_price: number
}

/** Summary shape returned by GET /invoices and dashboard endpoints. */
export interface InvoiceSummary {
  id: number
  vendor_id: number
  vendor_name: string
  invoice_number: string
  invoice_date: string
  due_date: string
  total_amount: number
  payment_status: PaymentStatus
  is_overdue: boolean
}

/** Full shape returned by GET/POST /invoices/:id. */
export interface InvoiceDetail {
  id: number
  vendor_id: number
  vendor: Vendor
  invoice_number: string
  invoice_date: string
  due_date: string
  tax_percent: number
  payment_status: PaymentStatus
  amount_paid: number
  subtotal: number
  tax_amount: number
  total_amount: number
  is_overdue: boolean
  items: InvoiceItem[]
}

export type DisplayStatus = 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue'

export function displayStatus(invoice: { payment_status: PaymentStatus; is_overdue: boolean }): DisplayStatus {
  if (invoice.is_overdue) return 'Overdue'
  if (invoice.payment_status === 'paid') return 'Paid'
  if (invoice.payment_status === 'partially_paid') return 'Partially Paid'
  return 'Unpaid'
}
