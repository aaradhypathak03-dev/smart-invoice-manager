import type { InvoiceDetail, InvoiceItemInput, InvoiceSummary, PaymentStatus, Vendor } from '../types'

const BASE_URL = 'http://127.0.0.1:8000/api'
const TOKEN_KEY = 'invoice_manager_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...headers, ...options.headers } })

  if (res.status === 401) {
    setToken(null)
    window.dispatchEvent(new Event('auth:unauthorized'))
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = body?.detail?.message || body?.detail || `Request failed with status ${res.status}`
    throw new ApiError(message, res.status)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Auth

export interface User {
  id: number
  name: string
  phone: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export function register(payload: { name: string; phone: string; password: string }): Promise<AuthResponse> {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export function login(payload: { phone: string; password: string }): Promise<AuthResponse> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
}

export function getMe(): Promise<User> {
  return request('/auth/me')
}

// Vendors

export function listVendors(): Promise<Vendor[]> {
  return request('/vendors')
}

export function createVendor(payload: {
  name: string
  email?: string
  phone?: string
  address?: string
}): Promise<Vendor> {
  return request('/vendors', { method: 'POST', body: JSON.stringify(payload) })
}

// Invoices

export interface InvoiceFilters {
  vendor_id?: number
  status?: PaymentStatus
  overdue?: boolean
  search?: string
}

export function listInvoices(filters: InvoiceFilters = {}): Promise<InvoiceSummary[]> {
  const params = new URLSearchParams()
  if (filters.vendor_id != null) params.set('vendor_id', String(filters.vendor_id))
  if (filters.status) params.set('status', filters.status)
  if (filters.overdue != null) params.set('overdue', String(filters.overdue))
  if (filters.search) params.set('search', filters.search)
  const qs = params.toString()
  return request(`/invoices${qs ? `?${qs}` : ''}`)
}

export function getInvoice(id: number): Promise<InvoiceDetail> {
  return request(`/invoices/${id}`)
}

export interface InvoiceInput {
  vendor_id: number
  invoice_number: string
  invoice_date: string
  due_date: string
  tax_percent: number
  items: InvoiceItemInput[]
}

export function createInvoice(payload: InvoiceInput): Promise<InvoiceDetail> {
  return request('/invoices', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateInvoiceStatus(
  id: number,
  payload: { payment_status: PaymentStatus; amount_paid: number },
): Promise<InvoiceDetail> {
  return request(`/invoices/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) })
}

// Dashboard

export interface DashboardSummary {
  total_outstanding: number
  overdue_amount: number
  overdue_count: number
  status_breakdown: { paid: number; partially_paid: number; unpaid: number; overdue: number }
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return request('/dashboard/summary')
}

export interface VendorSpend {
  vendor_id: number
  vendor_name: string
  total: number
}

export function getSpendByVendor(): Promise<VendorSpend[]> {
  return request('/dashboard/spend-by-vendor')
}

export function getRecentInvoices(limit = 5): Promise<InvoiceSummary[]> {
  return request(`/dashboard/recent-invoices?limit=${limit}`)
}

// AI Extraction

export interface ExtractedInvoice {
  vendor_name: string | null
  invoice_number: string | null
  invoice_date: string | null
  due_date: string | null
  tax_amount: number | null
  total_amount: number | null
  items: InvoiceItemInput[]
}

export function extractFromText(text: string): Promise<ExtractedInvoice> {
  const form = new FormData()
  form.set('text', text)
  return request('/ai/extract', { method: 'POST', body: form })
}

export function extractFromFile(file: File): Promise<ExtractedInvoice> {
  const form = new FormData()
  form.set('file', file)
  return request('/ai/extract', { method: 'POST', body: form })
}
