import { useState, type ReactNode } from 'react'
import { BrandMark, Icon, type IconName } from '../components/icons'
import { Avatar, cx, useToast } from '../components/ui'
import { Link, useRouter } from '../lib/router'

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'grid' },
  { to: '/admin/customers', label: 'Customers', icon: 'users' },
  { to: '/admin/technicians', label: 'Technicians', icon: 'wrench' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'calendar' },
  { to: '/admin/sessions', label: 'Sessions', icon: 'video' },
  { to: '/admin/payments', label: 'Payments', icon: 'card' },
  { to: '/admin/disputes', label: 'Disputes', icon: 'flag' },
  { to: '/admin/reviews', label: 'Reviews', icon: 'star' },
  { to: '/admin/commission', label: 'Commission', icon: 'percent' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
]

export default function AdminLayout({ children, title, actions }: { children: ReactNode; title: string; actions?: ReactNode }) {
  const { path } = useRouter()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[232px_1fr]">
      <aside className={cx('fixed inset-y-0 left-0 z-50 w-[232px] border-r border-border bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <BrandMark size={28} />
          <span className="text-[15px] font-bold tracking-tight">Setu</span>
          <span className="ml-auto rounded-sm bg-sunken px-1.5 py-0.5 font-mono text-[10px] font-semibold text-text-muted">OPS</span>
        </div>
        <nav className="p-3" aria-label="Admin">
          {NAV.map((n) => {
            const active = n.to === '/admin' ? path === '/admin' : path.startsWith(n.to)
            return (
              <Link key={n.to} to={n.to} className={cx('mb-0.5 flex h-9 items-center gap-3 rounded-sm px-3 text-[13px] font-semibold transition-colors',
                active ? 'bg-primary-soft text-primary' : 'text-text-secondary hover:bg-sunken hover:text-text-primary')}>
                <Icon name={n.icon} size={17} />
                {n.label}
                {n.label === 'Disputes' && <span className="ml-auto rounded-full bg-error px-1.5 font-mono text-[10px] text-white">2</span>}
              </Link>
            )
          })}
        </nav>
        <div className="absolute inset-x-3 bottom-3">
          <Link to="/" className="flex h-9 items-center gap-3 rounded-sm px-3 text-[13px] font-semibold text-text-muted hover:bg-sunken"><Icon name="logout" size={17} />Switch surface</Link>
        </div>
      </aside>
      {open && <button className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu" />}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur md:px-8">
          <button className="rounded-sm p-2 text-text-secondary hover:bg-sunken lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <form className="relative max-w-md flex-1" onSubmit={(e) => { e.preventDefault(); if (q) toast(`Search across bookings, people and payments isn't connected yet — "${q}"`) }}>
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search booking ID, customer, technician…" className="h-9 w-full rounded-sm border border-border bg-background pl-9 pr-3 text-[13px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative rounded-sm p-2 text-text-secondary hover:bg-sunken" aria-label="Notifications, 3 unread" onClick={() => toast('3 unread: 1 dispute opened, 2 technicians awaiting approval')}>
              <Icon name="bell" size={19} /><span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-error ring-2 ring-surface" />
            </button>
            <div className="flex items-center gap-2.5 border-l border-border pl-3">
              <Avatar initials="AD" size={32} />
              <div className="hidden leading-tight sm:block"><p className="text-[13px] font-semibold">Aditi Desai</p><p className="text-[11px] text-text-muted">Operations</p></div>
            </div>
          </div>
        </header>
        <div className="px-4 py-6 md:px-8 md:py-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {actions}
          </div>
          <div className="animate-fade-up">{children}</div>
        </div>
      </div>
    </div>
  )
}
