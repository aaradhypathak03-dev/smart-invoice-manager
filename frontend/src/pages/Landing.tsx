import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  FileText,
  Users,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  ArrowRight,
  UploadCloud,
  ClipboardCheck,
  BarChart3,
  CheckCircle2,
  Receipt,
} from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import Logo from '../components/Logo'
import { useAuthStore } from '../store/AuthStore'

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Extraction',
    description: 'Snap a photo or upload a PDF — Gemini AI reads the vendor, amount, and line items for you.',
  },
  {
    icon: FileText,
    title: 'Invoice Tracking',
    description: 'Create, search, and filter invoices with a full history of every transaction.',
  },
  {
    icon: Users,
    title: 'Vendor Management',
    description: 'Keep a clean directory of vendors and see exactly what you owe each one.',
  },
  {
    icon: LayoutDashboard,
    title: 'Spending Dashboard',
    description: 'Visualize spending trends and payment status at a glance.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by Design',
    description: 'JWT-based authentication keeps your business data locked to your account.',
  },
  {
    icon: Zap,
    title: 'Built for Speed',
    description: 'A fast, focused workflow — no clutter, no unnecessary steps.',
  },
]

const STEPS = [
  { icon: UploadCloud, title: 'Upload', description: 'Add an invoice as text, an image, or a PDF.' },
  { icon: Sparkles, title: 'AI Extracts', description: 'Gemini pulls out vendor, amount, and item details.' },
  { icon: ClipboardCheck, title: 'Review & Save', description: 'Confirm the details and save it to your records.' },
  { icon: BarChart3, title: 'Track & Report', description: 'Monitor payment status and spending over time.' },
]

export default function Landing() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="text-base font-bold text-text-primary">Smart Invoice Manager</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-text-secondary md:flex">
            <a href="#features" className="transition-colors hover:text-text-primary">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-text-primary">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" className="gap-1.5">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="overflow-hidden bg-bg-secondary px-6 pb-20 pt-36">
        <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-bg px-3 py-1 text-xs font-semibold text-text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered invoice extraction
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-text-primary md:text-5xl">
              Manage invoices smarter, not harder.
            </h1>
            <p className="mt-4 max-w-md text-lg text-text-secondary">
              Add vendors, track invoices, monitor payment status, and let AI pull the numbers straight from a
              photo or PDF — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="primary" className="gap-1.5 px-5 py-2.5 text-base">
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button variant="primary" className="gap-1.5 px-5 py-2.5 text-base">
                      Get Started Free <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" className="px-5 py-2.5 text-base">
                      Log in
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-text-secondary">
              Free to use · No credit card required · Built for Hackathon Problem Statement 4
            </p>
          </Reveal>

          <Reveal delay={150} className="relative">
            <div className="pointer-events-none absolute -top-4 -right-4 z-10 flex animate-float items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-text-primary shadow-lg">
              <Sparkles className="h-4 w-4 text-brand" />
              AI extracted in 2s
            </div>
            <div className="pointer-events-none absolute -bottom-4 -left-4 z-10 flex animate-float-slow items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-text-primary shadow-lg">
              <CheckCircle2 className="h-4 w-4 text-success" />
              INV-1042 marked Paid
            </div>

            <Card className="p-5 shadow-lg">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Receipt className="h-4 w-4 text-brand" />
                Recent Invoices
              </div>
              <div className="flex flex-col divide-y divide-border">
                {[
                  { vendor: 'Acme Supplies Co.', amount: '₹24,500', status: 'Paid' },
                  { vendor: 'BlueRidge Traders', amount: '₹8,900', status: 'Partially Paid' },
                  { vendor: 'Nimbus Logistics', amount: '₹41,200', status: 'Overdue' },
                ].map((row) => (
                  <div key={row.vendor} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium text-text-primary">{row.vendor}</p>
                      <p className="text-text-secondary">{row.amount}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        row.status === 'Paid'
                          ? 'bg-success-bg text-success'
                          : row.status === 'Overdue'
                            ? 'bg-danger-bg text-danger'
                            : 'bg-warning-bg text-warning'
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold text-text-primary">Everything you need, nothing you don't</h2>
            <p className="mt-3 text-text-secondary">
              A focused toolkit for tracking vendors, invoices, and payments — with AI doing the tedious part.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <Reveal key={title} delay={i * 80}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-bg text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-text-primary">{title}</h3>
                  <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-bg-secondary px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold text-text-primary">From invoice to insight in four steps</h2>
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, description }, i) => (
              <Reveal key={title} delay={i * 100} className="relative text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-md transition-transform duration-300 hover:scale-110">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-brand ring-1 ring-border">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-text-primary">{title}</h3>
                <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <Reveal className="mx-auto max-w-4xl rounded-2xl bg-brand px-8 py-14 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-white">Ready to simplify your invoicing?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">
            Create your account in seconds and start tracking vendors and invoices today.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to={user ? '/dashboard' : '/register'}>
              <Button
                variant="secondary"
                className="gap-1.5 border-none bg-white px-5 py-2.5 text-base text-brand hover:bg-white/90"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-text-secondary sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold text-text-primary">Smart Invoice Manager</span>
          </div>
          <p>Built for Hackathon Problem Statement 4 · © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
