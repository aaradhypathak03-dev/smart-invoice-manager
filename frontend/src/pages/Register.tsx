import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Logo from '../components/Logo'
import { useAuthStore } from '../store/AuthStore'
import { ApiError, register as registerApi } from '../api/client'

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must contain at least one letter and one number.'
  }
  return null
}

function toE164(phone: string): string | null {
  const digits = phone.replace(/[\s\-()]/g, '').replace(/^\+?91/, '')
  if (!/^[6-9]\d{9}$/.test(digits)) return null
  return `+91${digits}`
}

export default function Register() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function fieldErrors(): string | null {
    if (name.trim().length < 2) return 'Enter your full name.'
    const e164 = toE164(phone)
    if (!e164) return 'Enter a valid 10-digit Indian mobile number.'
    const pwErr = validatePassword(password)
    if (pwErr) return pwErr
    if (password !== confirmPassword) return 'Passwords do not match.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = fieldErrors()
    if (err) {
      setError(err)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await registerApi({ name: name.trim(), phone: toE164(phone)!, password })
      setSession(res.access_token, res.user)
      navigate('/dashboard')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex flex-col items-center gap-2">
          <Logo className="h-10 w-10" />
          <h1 className="text-xl font-bold text-text-primary">Smart Invoice Manager</h1>
        </Link>

        <Card>
          <h2 className="mb-5 text-lg font-semibold text-text-primary">Create an account</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-secondary">Full Name</span>
              <input
                className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-secondary">Phone Number</span>
              <input
                type="tel"
                placeholder="9876543210"
                className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-secondary">Password</span>
              <input
                type="password"
                className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="text-xs text-text-secondary">
                At least 8 characters, with a letter and a number.
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-text-secondary">Confirm Password</span>
              <input
                type="password"
                className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>

            {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}

            <Button type="submit" disabled={loading} className="mt-2 w-full justify-center">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
