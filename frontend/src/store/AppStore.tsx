import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../api/client'
import type { InvoiceSummary, PaymentStatus, Vendor } from '../types'

interface AppStoreValue {
  vendors: Vendor[]
  invoices: InvoiceSummary[]
  loading: boolean
  error: string | null
  refreshVendors: () => Promise<void>
  refreshInvoices: () => Promise<void>
  addVendor: (vendor: { name: string; email?: string; phone?: string; address?: string }) => Promise<Vendor>
  addInvoice: (input: api.InvoiceInput) => Promise<number>
  setInvoiceStatus: (id: number, paymentStatus: PaymentStatus, amountPaid: number) => Promise<void>
}

const AppStoreContext = createContext<AppStoreValue | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshVendors = useCallback(async () => {
    setVendors(await api.listVendors())
  }, [])

  const refreshInvoices = useCallback(async () => {
    setInvoices(await api.listInvoices())
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([refreshVendors(), refreshInvoices()])
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [refreshVendors, refreshInvoices])

  async function addVendor(vendor: { name: string; email?: string; phone?: string; address?: string }) {
    const created = await api.createVendor(vendor)
    await refreshVendors()
    return created
  }

  async function addInvoice(input: api.InvoiceInput) {
    const created = await api.createInvoice(input)
    await refreshInvoices()
    return created.id
  }

  async function setInvoiceStatus(id: number, paymentStatus: PaymentStatus, amountPaid: number) {
    await api.updateInvoiceStatus(id, { payment_status: paymentStatus, amount_paid: amountPaid })
    await refreshInvoices()
  }

  return (
    <AppStoreContext.Provider
      value={{
        vendors,
        invoices,
        loading,
        error,
        refreshVendors,
        refreshInvoices,
        addVendor,
        addInvoice,
        setInvoiceStatus,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  )
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
