import type { PaymentStatus } from '../types'
import { displayStatus } from '../types'

const STYLES: Record<string, string> = {
  Paid: 'bg-success-bg text-success',
  'Partially Paid': 'bg-warning-bg text-warning',
  Unpaid: 'bg-neutral-bg text-neutral',
  Overdue: 'bg-danger-bg text-danger',
}

interface Props {
  invoice: { payment_status: PaymentStatus; is_overdue: boolean }
}

export default function StatusBadge({ invoice }: Props) {
  const status = displayStatus(invoice)
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {status}
    </span>
  )
}
