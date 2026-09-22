import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAppStore } from '../store/AppStore'
import { ApiError } from '../api/client'
import { formatCurrency } from '../lib/format'

interface FormItem {
  id: string
  description: string
  quantity: number
  unit_price: number
}

let itemSeq = 100

function emptyItem(): FormItem {
  itemSeq += 1
  return { id: `new-${itemSeq}`, description: '', quantity: 1, unit_price: 0 }
}

function lineTotal(item: FormItem): number {
  return item.quantity * item.unit_price
}

export default function InvoiceForm() {
  const navigate = useNavigate()
  const { vendors, addInvoice } = useAppStore()
  const [vendorId, setVendorId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [taxPercent, setTaxPercent] = useState(0)
  const [items, setItems] = useState<FormItem[]>([emptyItem()])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const subtotal = items.reduce((sum, i) => sum + lineTotal(i), 0)
  const taxAmount = subtotal * (taxPercent / 100)
  const total = subtotal + taxAmount

  function updateItem(id: string, patch: Partial<FormItem>) {
    setItems((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function removeItem(id: string) {
    setItems((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows))
  }

  async function handleSave() {
    if (!vendorId || !invoiceNumber.trim() || !invoiceDate || !dueDate) {
      setError('Please fill in vendor, invoice number, invoice date, and due date.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const id = await addInvoice({
        vendor_id: Number(vendorId),
        invoice_number: invoiceNumber.trim(),
        invoice_date: invoiceDate,
        due_date: dueDate,
        tax_percent: taxPercent,
        items: items.map(({ description, quantity, unit_price }) => ({ description, quantity, unit_price })),
      })
      navigate(`/invoices/${id}`)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">New Invoice</h1>
        <Button variant="secondary" onClick={() => navigate('/ai-extract')}>
          <Sparkles className="h-4 w-4" />
          Extract from Text/Image/PDF
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-secondary">
              Vendor <span className="text-danger">*</span>
            </span>
            <select
              className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-secondary">
              Invoice Number <span className="text-danger">*</span>
            </span>
            <input
              className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
              placeholder="INV-1001"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-secondary">
              Invoice Date <span className="text-danger">*</span>
            </span>
            <input
              type="date"
              className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-secondary">
              Due Date <span className="text-danger">*</span>
            </span>
            <input
              type="date"
              className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Line Items</h2>
          <div className="mb-2 grid grid-cols-[1fr_80px_120px_120px_32px] gap-2 text-xs font-semibold uppercase text-text-secondary">
            <span>Description</span>
            <span>Qty</span>
            <span>Unit Price</span>
            <span className="text-right">Subtotal</span>
            <span />
          </div>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_80px_120px_120px_32px] items-center gap-2">
                <input
                  className="rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Item description"
                />
                <input
                  type="number"
                  min={0}
                  className="rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                />
                <input
                  type="number"
                  min={0}
                  className="rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand"
                  value={item.unit_price}
                  onChange={(e) => updateItem(item.id, { unit_price: Number(e.target.value) })}
                />
                <span className="text-right font-mono text-sm text-text-primary">
                  {formatCurrency(lineTotal(item))}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-danger-bg hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setItems((rows) => [...rows, emptyItem()])}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add Line Item
          </button>
        </div>

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Tax (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                className="w-28 rounded-md border border-border px-2.5 py-1.5 text-right text-sm outline-none focus:ring-2 focus:ring-brand"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <span>Tax Amount</span>
              <span className="font-mono">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-text-primary">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Invoice'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
