import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { useAppStore } from '../store/AppStore'
import { listInvoices } from '../api/client'
import type { DisplayStatus, InvoiceSummary, PaymentStatus } from '../types'
import { formatCurrency, formatDate } from '../lib/format'

const STATUS_FILTERS: (DisplayStatus | 'All')[] = ['All', 'Unpaid', 'Partially Paid', 'Paid', 'Overdue']

const STATUS_MAP: Record<Exclude<DisplayStatus, 'Overdue'>, PaymentStatus> = {
  Unpaid: 'unpaid',
  'Partially Paid': 'partially_paid',
  Paid: 'paid',
}

export default function InvoiceList() {
  const navigate = useNavigate()
  const { vendors } = useAppStore()
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [vendorFilter, setVendorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<DisplayStatus | 'All'>('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    listInvoices({
      vendor_id: vendorFilter === 'all' ? undefined : Number(vendorFilter),
      status: statusFilter === 'All' || statusFilter === 'Overdue' ? undefined : STATUS_MAP[statusFilter],
      overdue: statusFilter === 'Overdue' ? true : undefined,
      search: search || undefined,
    })
      .then(setInvoices)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load invoices'))
      .finally(() => setLoading(false))
  }, [vendorFilter, statusFilter, search])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Invoices</h1>
        <Button onClick={() => navigate('/invoices/new')}>
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
        >
          <option value="all">All Vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        <div className="flex rounded-md border border-border p-0.5 text-sm">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${
                statusFilter === s ? 'bg-brand text-white' : 'text-text-secondary hover:bg-bg-secondary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
          <input
            className="w-64 rounded-md border border-border py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand"
            placeholder="Search invoice # or vendor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}

      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-secondary text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Invoice Date</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => navigate(`/invoices/${inv.id}`)}
                className={`cursor-pointer border-b border-border last:border-0 hover:bg-bg-secondary ${
                  inv.is_overdue ? 'border-l-4 border-l-danger' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-text-primary">{inv.vendor_name}</td>
                <td className="px-4 py-3 font-mono text-text-primary">{inv.invoice_number}</td>
                <td className="px-4 py-3 text-text-secondary">{formatDate(inv.invoice_date)}</td>
                <td className="px-4 py-3 text-text-secondary">{formatDate(inv.due_date)}</td>
                <td className="px-4 py-3 text-right font-mono text-text-primary">
                  {formatCurrency(inv.total_amount)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge invoice={inv} />
                </td>
              </tr>
            ))}
            {!loading && invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-text-secondary">
                  No invoices match your filters.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-text-secondary">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

