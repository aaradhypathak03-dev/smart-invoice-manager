import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore'
import { AppStoreProvider } from '../store/AppStore'

export default function RequireAuth() {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-text-secondary">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppStoreProvider>
      <Outlet />
    </AppStoreProvider>
  )
}
