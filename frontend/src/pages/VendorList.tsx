import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAppStore } from '../store/AppStore'

export default function VendorList() {
  const { vendors, addVendor } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [error, setError] = useState('')

  async function handleAdd() {
    if (!form.name.trim()) return
    try {
      await addVendor(form)
      setForm({ name: '', email: '', phone: '', address: '' })
      setShowForm(false)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save vendor')
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Vendors</h1>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Vendor'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="mb-4 text-base font-semibold">New Vendor</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          </div>
          {error && <p className="mt-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Save Vendor</Button>
          </div>
        </Card>
      )}

      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-secondary text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Address</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="border-b border-border last:border-0 hover:bg-bg-secondary">
                <td className="px-4 py-3 font-medium text-text-primary">{v.name}</td>
                <td className="px-4 py-3 text-text-secondary">{v.email || '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{v.phone || '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{v.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-secondary">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      <input
        className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
