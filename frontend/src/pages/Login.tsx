import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAuthStore } from '../store/AuthStore'
import { ApiError } from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim() || !password) {
      setError('Enter your phone number and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(phone.trim(), password)
      navigate('/')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Receipt className="h-8 w-8 text-brand" />
          <h1 className="text-xl font-bold text-text-primary">Smart Invoice Manager</h1>
        </div>

        <Card>
          <h2 className="mb-5 text-lg font-semibold text-text-primary">Log in</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            </label>

            {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}

            <Button type="submit" disabled={loading} className="mt-2 w-full justify-center">
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
