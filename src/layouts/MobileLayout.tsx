import type { ReactNode } from 'react'
import { Icon, type IconName } from '../components/icons'
import { cx } from '../components/ui'
import { useRouter } from '../lib/router'

export type NavItem = { to: string; label: string; icon: IconName; match?: string[] }

export function MobileShell({ children, nav, dark }: { children: ReactNode; nav?: NavItem[]; dark?: boolean }) {
  const { path, navigate } = useRouter()
  return (
    <div className={cx('min-h-screen sm:py-6', dark ? 'bg-ink' : 'bg-[#e9ebef]')}>
      <div className={cx('relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col sm:min-h-[calc(100vh-48px)] sm:overflow-hidden sm:rounded-[28px] sm:border sm:shadow-raised',
        dark ? 'bg-ink sm:border-white/10' : 'bg-background sm:border-border')}>
        <main className={cx('flex flex-1 flex-col', nav && 'pb-20')}>{children}</main>
        {nav && (
          <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[440px] border-t border-border bg-surface/95 backdrop-blur sm:absolute" aria-label="Primary">
            <ul className="flex">
              {nav.map((n) => {
                const active = [n.to, ...(n.match ?? [])].some((m) => path === m || path.startsWith(m + '/'))
                return (
                  <li key={n.to} className="flex-1">
                    <button onClick={() => navigate(n.to)} aria-current={active ? 'page' : undefined}
                      className={cx('flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors', active ? 'text-primary' : 'text-text-muted hover:text-text-secondary')}>
                      <Icon name={n.icon} size={22} strokeWidth={active ? 2 : 1.6} />
                      {n.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}

export function TopBar({ title, onBack, right, sub }: { title?: string; onBack?: () => void; right?: ReactNode; sub?: string }) {
  const { back } = useRouter()
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/70 bg-background/90 px-2 backdrop-blur">
      <button onClick={onBack ?? back} className="inline-flex size-10 items-center justify-center rounded-md text-text-secondary hover:bg-sunken" aria-label="Go back">
        <Icon name="chevronLeft" size={22} />
      </button>
      <div className="min-w-0 flex-1">
        {title && <p className="truncate text-[15px] font-bold">{title}</p>}
        {sub && <p className="truncate text-xs text-text-muted">{sub}</p>}
      </div>
      {right}
    </header>
  )
}

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('flex flex-1 flex-col px-5 pb-6 pt-5 animate-fade-up', className)}>{children}</div>
}

export function StickyAction({ children }: { children: ReactNode }) {
  return <div className="sticky bottom-0 z-20 mt-auto border-t border-border bg-background/95 px-5 py-4 backdrop-blur">{children}</div>
}
