import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../api/client'
import type { User } from '../api/client'

interface AuthStoreValue {
  user: User | null
  loading: boolean
  login: (phone: string, password: string) => Promise<void>
  logout: () => void
  setSession: (token: string, user: User) => void
}

const AuthStoreContext = createContext<AuthStoreValue | null>(null)

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = api.getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .getMe()
      .then(setUser)
      .catch(() => api.setToken(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  async function login(phone: string, password: string) {
    const res = await api.login({ phone, password })
    api.setToken(res.access_token)
    setUser(res.user)
  }

  function logout() {
    api.setToken(null)
    setUser(null)
  }

  function setSession(token: string, user: User) {
    api.setToken(token)
    setUser(user)
  }

  return (
    <AuthStoreContext.Provider value={{ user, loading, login, logout, setSession }}>
      {children}
    </AuthStoreContext.Provider>
  )
}

export function useAuthStore(): AuthStoreValue {
  const ctx = useContext(AuthStoreContext)
  if (!ctx) throw new Error('useAuthStore must be used within AuthStoreProvider')
  return ctx
}
