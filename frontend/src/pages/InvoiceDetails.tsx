import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { useAppStore } from '../store/AppStore'
import { getInvoice } from '../api/client'
import type { InvoiceDetail, PaymentStatus } from '../types'
import { formatCurrency, formatDate } from '../lib/format'

export default function InvoiceDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setInvoiceStatus } = useAppStore()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getInvoice(Number(id))
      .then(setInvoice)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load invoice'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(status: PaymentStatus) {
    if (!invoice) return
    await setInvoiceStatus(invoice.id, status, invoice.amount_paid)
    setInvoice(await getInvoice(invoice.id))
  }

  async function handleAmountPaidChange(amount: number) {
    if (!invoice) return
    await setInvoiceStatus(invoice.id, invoice.payment_status, amount)
    setInvoice(await getInvoice(invoice.id))
  }

  if (loading) {
    return <p className="text-text-secondary">Loading...</p>
  }

  if (error || !invoice) {
    return <p className="text-text-secondary">{error || 'Invoice not found.'}</p>
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/invoices')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Invoices
      </button>

      <Card>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold text-text-primary">{invoice.invoice_number}</h1>
            <p className="mt-1 text-sm text-text-secondary">{invoice.vendor.name}</p>
          </div>
          <StatusBadge invoice={invoice} />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 border-y border-border py-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary">Invoice Date</p>
            <p className="mt-1 text-text-primary">{formatDate(invoice.invoice_date)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary">Due Date</p>
            <p className="mt-1 text-text-primary">{formatDate(invoice.due_date)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary">Vendor Email</p>
            <p className="mt-1 text-text-primary">{invoice.vendor.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary">Vendor Phone</p>
            <p className="mt-1 text-text-primary">{invoice.vendor.phone || '—'}</p>
          </div>
        </div>

        <h2 className="mb-3 text-sm font-semibold text-text-primary">Line Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit Price</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="py-2 text-text-primary">{item.description}</td>
                <td className="py-2 text-right text-text-secondary">{item.quantity}</td>
                <td className="py-2 text-right font-mono text-text-secondary">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="py-2 text-right font-mono text-text-primary">{formatCurrency(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <span>Tax ({invoice.tax_percent}%)</span>
              <span className="font-mono">{formatCurrency(invoice.tax_amount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-text-primary">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-end gap-4 border-t border-border pt-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-secondary">Payment Status</span>
            <select
              className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
              value={invoice.payment_status}
              onChange={(e) => handleStatusChange(e.target.value as PaymentStatus)}
            >
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-secondary">Amount Paid</span>
            <input
              type="number"
              min={0}
              className="w-32 rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
              value={invoice.amount_paid}
              onChange={(e) => handleAmountPaidChange(Number(e.target.value))}
            />
          </label>
        </div>
      </Card>
    </div>
  )
}
