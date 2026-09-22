import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, Sparkles, Receipt, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/AuthStore'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/vendors', label: 'Vendors', icon: Users },
  { to: '/ai-extract', label: 'AI Extraction', icon: Sparkles },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-white px-4 py-6">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Receipt className="h-6 w-6 text-brand" />
          <span className="text-lg font-bold text-text-primary">Invoice Manager</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <p className="truncate px-2 text-sm font-medium text-text-primary">{user?.name}</p>
          <p className="truncate px-2 text-xs text-text-secondary">{user?.phone}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}
