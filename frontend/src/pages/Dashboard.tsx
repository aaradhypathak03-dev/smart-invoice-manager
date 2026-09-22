import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { getDashboardSummary, getRecentInvoices, getSpendByVendor } from '../api/client'
import type { DashboardSummary, InvoiceSummary, VendorSpend } from '../api/client'
import { formatCurrency, formatDate } from '../lib/format'

const STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-success',
  'Partially Paid': 'bg-warning',
  Unpaid: 'bg-neutral',
  Overdue: 'bg-danger',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [spend, setSpend] = useState<VendorSpend[]>([])
  const [recent, setRecent] = useState<InvoiceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getDashboardSummary(), getSpendByVendor(), getRecentInvoices(5)])
      .then(([s, sp, r]) => {
        setSummary(s)
        setSpend(sp)
        setRecent(r)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-text-secondary">Loading...</p>
  if (error || !summary) return <p className="text-text-secondary">{error || 'No data'}</p>

  const breakdown = summary.status_breakdown
  const totalInvoices = breakdown.paid + breakdown.partially_paid + breakdown.unpaid + breakdown.overdue || 1
  const maxSpend = Math.max(...spend.map((v) => v.total), 1)

  const statusRows: { label: string; count: number }[] = [
    { label: 'Paid', count: breakdown.paid },
    { label: 'Partially Paid', count: breakdown.partially_paid },
    { label: 'Unpaid', count: breakdown.unpaid },
    { label: 'Overdue', count: breakdown.overdue },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-primary">Dashboard</h1>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-semibold uppercase text-text-secondary">Total Outstanding</p>
          <p className="mt-2 font-mono text-2xl font-bold text-text-primary">
            {formatCurrency(summary.total_outstanding)}
          </p>
        </Card>
        <Card className="border-t-4 border-t-danger">
          <p className="text-xs font-semibold uppercase text-text-secondary">Overdue Amount</p>
          <p className="mt-2 font-mono text-2xl font-bold text-danger">{formatCurrency(summary.overdue_amount)}</p>
        </Card>
        <Card className="border-t-4 border-t-danger">
          <p className="text-xs font-semibold uppercase text-text-secondary">Overdue Invoices</p>
          <p className="mt-2 font-mono text-2xl font-bold text-danger">{summary.overdue_count}</p>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Status Breakdown</h2>
          <div className="flex flex-col gap-3">
            {statusRows.map(({ label, count }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs text-text-secondary">
                  <span>{label}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-bg-secondary">
                  <div
                    className={`h-full ${STATUS_COLORS[label]}`}
                    style={{ width: `${(count / totalInvoices) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-text-primary">Spend by Vendor</h2>
          <div className="flex flex-col gap-3">
            {spend.map((v) => (
              <div key={v.vendor_id}>
                <div className="mb-1 flex justify-between text-xs text-text-secondary">
                  <span>{v.vendor_name}</span>
                  <span className="font-mono">{formatCurrency(v.total)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-bg-secondary">
                  <div className="h-full bg-brand" style={{ width: `${(v.total / maxSpend) * 100}%` }} />
                </div>
              </div>
            ))}
            {spend.length === 0 && <p className="text-xs text-text-secondary">No invoices yet.</p>}
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-text-primary">Recent Invoices</h2>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {recent.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => navigate(`/invoices/${inv.id}`)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-bg-secondary"
              >
                <td className="px-5 py-3 font-medium text-text-primary">{inv.vendor_name}</td>
                <td className="px-5 py-3 font-mono text-text-secondary">{inv.invoice_number}</td>
                <td className="px-5 py-3 text-text-secondary">{formatDate(inv.invoice_date)}</td>
                <td className="px-5 py-3 text-right font-mono text-text-primary">
                  {formatCurrency(inv.total_amount)}
                </td>
                <td className="px-5 py-3 text-right">
                  <StatusBadge invoice={inv} />
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-text-secondary">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
