import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, FileUp, Sparkles } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAppStore } from '../store/AppStore'
import { ApiError, extractFromFile, extractFromText, type ExtractedInvoice } from '../api/client'
import { formatCurrency } from '../lib/format'

interface FormItem {
  id: string
  description: string
  quantity: number
  unit_price: number
}

type MissingField = 'vendor' | 'invoiceNumber' | 'invoiceDate' | 'dueDate' | 'items'

interface ExtractedForm {
  vendorName: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  taxPercent: number
  items: FormItem[]
  /** Fields the AI could not find - shown as "Not detected" hints until the user fills them in. */
  missingFields: Set<MissingField>
  /** AI's own stated total, kept only to cross-check against our computed total. */
  aiStatedTotal: number | null
}

let itemSeq = 100

function lineTotal(item: FormItem): number {
  return item.quantity * item.unit_price
}

function buildForm(result: ExtractedInvoice, matchedVendorName: string | null): ExtractedForm {
  const missingFields: ExtractedForm['missingFields'] = new Set()
  if (!matchedVendorName) missingFields.add('vendor')
  if (!result.invoice_number) missingFields.add('invoiceNumber')
  if (!result.invoice_date) missingFields.add('invoiceDate')
  if (!result.due_date) missingFields.add('dueDate')
  if (result.items.length === 0) missingFields.add('items')

  const items: FormItem[] =
    result.items.length > 0
      ? result.items.map((item) => ({ id: `e${itemSeq++}`, ...item }))
      : [{ id: `e${itemSeq++}`, description: '', quantity: 1, unit_price: 0 }]

  const subtotal = items.reduce((sum, i) => sum + lineTotal(i), 0)
  const taxPercent =
    result.tax_amount != null && subtotal > 0 ? Number(((result.tax_amount / subtotal) * 100).toFixed(2)) : 0

  return {
    vendorName: result.vendor_name ?? '',
    invoiceNumber: result.invoice_number ?? '',
    invoiceDate: result.invoice_date ?? '',
    dueDate: result.due_date ?? '',
    taxPercent,
    items,
    missingFields,
    aiStatedTotal: result.total_amount,
  }
}

export default function AiExtract() {
  const navigate = useNavigate()
  const { vendors, addInvoice } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [extracted, setExtracted] = useState<ExtractedForm | null>(null)
  const [vendorId, setVendorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function runExtraction(fn: () => Promise<ExtractedInvoice>) {
    setLoading(true)
    setError('')
    try {
      const result = await fn()
      const matchedVendor = vendors.find((v) => v.name.toLowerCase() === (result.vendor_name ?? '').toLowerCase())
      setExtracted(buildForm(result, matchedVendor?.name ?? null))
      setVendorId(matchedVendor?.id.toString() ?? '')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Extraction failed')
    } finally {
      setLoading(false)
    }
  }

  function handleExtractText() {
    if (!text.trim()) {
      setError('Paste some invoice text first, or upload a file.')
      return
    }
    runExtraction(() => extractFromText(text))
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    runExtraction(() => extractFromFile(file))
    e.target.value = ''
  }

  function updateItem(id: string, patch: Partial<FormItem>) {
    if (!extracted) return
    setExtracted({
      ...extracted,
      items: extracted.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      missingFields: withoutMissing(extracted.missingFields, 'items'),
    })
  }

  function withoutMissing(set: Set<MissingField>, key: MissingField): Set<MissingField> {
    const next = new Set(set)
    next.delete(key)
    return next
  }

  async function handleConfirm() {
    if (!extracted) return
    if (!vendorId || !extracted.invoiceNumber.trim() || !extracted.invoiceDate || !extracted.dueDate) {
      setError('Please fill in vendor, invoice number, invoice date, and due date.')
      return
    }
    if (extracted.items.some((i) => !i.description.trim())) {
      setError('Every line item needs a description.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const id = await addInvoice({
        vendor_id: Number(vendorId),
        invoice_number: extracted.invoiceNumber.trim(),
        invoice_date: extracted.invoiceDate,
        due_date: extracted.dueDate,
        tax_percent: extracted.taxPercent,
        items: extracted.items.map(({ description, quantity, unit_price }) => ({
          description,
          quantity,
          unit_price,
        })),
      })
      navigate(`/invoices/${id}`)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  if (!extracted) {
    return (
      <div className="max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">Extract Invoice</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Paste invoice text, or upload an image/PDF. Extracted data will be shown for review before saving —
          nothing is saved automatically.
        </p>

        <Card>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-secondary">Paste invoice text</span>
            <textarea
              className="h-40 rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
              placeholder="Paste raw invoice text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>

          <div className="my-4 flex items-center gap-3 text-xs text-text-secondary">
            <div className="h-px flex-1 bg-border" />
            OR
            <div className="h-px flex-1 bg-border" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileSelected}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-md border border-dashed border-border py-8 text-text-secondary hover:border-brand hover:text-brand"
          >
            <FileUp className="h-6 w-6" />
            <span className="text-sm font-medium">Upload image or PDF</span>
          </button>

          {error && <p className="mt-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}

          <div className="mt-6 flex justify-end">
            <Button onClick={handleExtractText} disabled={loading}>
              <Sparkles className="h-4 w-4" />
              {loading ? 'Extracting...' : 'Extract Data'}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const subtotal = extracted.items.reduce((sum, i) => sum + lineTotal(i), 0)
  const taxAmount = subtotal * (extracted.taxPercent / 100)
  const total = subtotal + taxAmount

  const totalMismatch =
    extracted.aiStatedTotal != null && Math.abs(extracted.aiStatedTotal - total) > Math.max(1, total * 0.01)

  const missing = extracted.missingFields

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold text-text-primary">Review Extracted Invoice</h1>
      <p className="mb-6 text-sm text-text-secondary">
        AI-suggested values below — verify and edit before saving. Fields the AI could not find are marked
        "Not detected" and need to be filled in manually.
      </p>

      <Card>
        <div className="grid grid-cols-2 gap-4">
          <FieldLabel label="Vendor" missing={missing.has('vendor')}>
            <select
              className={inputClass(missing.has('vendor'))}
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">
                {missing.has('vendor') ? 'Not detected — select vendor' : 'Select vendor'}
              </option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {missing.has('vendor') && extracted.vendorName && (
              <span className="text-xs text-text-secondary">
                AI read "{extracted.vendorName}" — no matching vendor found, add one first or pick manually.
              </span>
            )}
          </FieldLabel>

          <FieldLabel label="Invoice Number" missing={missing.has('invoiceNumber')}>
            <input
              className={inputClass(missing.has('invoiceNumber'))}
              placeholder={missing.has('invoiceNumber') ? 'Not detected' : ''}
              value={extracted.invoiceNumber}
              onChange={(e) =>
                setExtracted({
                  ...extracted,
                  invoiceNumber: e.target.value,
                  missingFields: withoutMissing(missing, 'invoiceNumber'),
                })
              }
            />
          </FieldLabel>

          <FieldLabel label="Invoice Date" missing={missing.has('invoiceDate')}>
            <input
              type="date"
              className={inputClass(missing.has('invoiceDate'))}
              value={extracted.invoiceDate}
              onChange={(e) =>
                setExtracted({
                  ...extracted,
                  invoiceDate: e.target.value,
                  missingFields: withoutMissing(missing, 'invoiceDate'),
                })
              }
            />
          </FieldLabel>

          <FieldLabel label="Due Date" missing={missing.has('dueDate')}>
            <input
              type="date"
              className={inputClass(missing.has('dueDate'))}
              value={extracted.dueDate}
              onChange={(e) =>
                setExtracted({
                  ...extracted,
                  dueDate: e.target.value,
                  missingFields: withoutMissing(missing, 'dueDate'),
                })
              }
            />
          </FieldLabel>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Line Items</h2>
            {missing.has('items') && (
              <span className="text-xs font-medium text-danger">Not detected — add items manually</span>
            )}
          </div>
          <div className="mb-2 grid grid-cols-[1fr_80px_120px_120px] gap-2 text-xs font-semibold uppercase text-text-secondary">
            <span>Description</span>
            <span>Qty</span>
            <span>Unit Price</span>
            <span className="text-right">Subtotal</span>
          </div>
          <div className="flex flex-col gap-2">
            {extracted.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_80px_120px_120px] items-center gap-2">
                <input
                  className={inputClass(!item.description.trim())}
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                />
                <input
                  type="number"
                  className="rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                />
                <input
                  type="number"
                  className="rounded-md border border-border px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand"
                  value={item.unit_price}
                  onChange={(e) => updateItem(item.id, { unit_price: Number(e.target.value) })}
                />
                <span className="text-right font-mono text-sm text-text-primary">
                  {formatCurrency(lineTotal(item))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Tax (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                className="w-28 rounded-md border border-border px-2.5 py-1.5 text-right text-sm outline-none focus:ring-2 focus:ring-brand"
                value={extracted.taxPercent}
                onChange={(e) => setExtracted({ ...extracted, taxPercent: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <span>Tax Amount</span>
              <span className="font-mono">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-text-primary">
              <span>Total (computed)</span>
              <span className="font-mono">{formatCurrency(total)}</span>
            </div>
            {extracted.aiStatedTotal != null && (
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>AI read total as</span>
                <span className="font-mono">{formatCurrency(extracted.aiStatedTotal)}</span>
              </div>
            )}
          </div>
        </div>

        {totalMismatch && (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-warning-bg px-3 py-2 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            The AI's total ({formatCurrency(extracted.aiStatedTotal!)}) doesn't match the total computed from line
            items + tax ({formatCurrency(total)}). Double-check the quantities, prices, and tax before saving — the
            computed total is what will actually be saved.
          </p>
        )}

        {error && <p className="mt-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setExtracted(null)}>
            Discard
          </Button>
          <Button onClick={handleConfirm} disabled={saving}>
            {saving ? 'Saving...' : 'Confirm & Save'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function inputClass(missing: boolean): string {
  return `rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand w-full ${
    missing ? 'border-danger bg-danger-bg' : 'border-border'
  }`
}

function FieldLabel({
  label,
  missing,
  children,
}: {
  label: string
  missing: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
        {label}
        {missing && <span className="text-danger">Not detected</span>}
      </span>
      {children}
    </label>
  )
}
