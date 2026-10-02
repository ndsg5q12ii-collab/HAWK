import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { Icon, type IconName } from './icons'
import type { BookingStatus, TechAvailability, VerificationStatus, PaymentStatus, DisputeStatus } from '../types'

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
export { cx }

/* ---------- Button ---------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'dark'
const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-pressed shadow-soft',
  secondary: 'bg-surface text-text-primary border border-border-strong hover:bg-sunken active:bg-border',
  ghost: 'text-primary hover:bg-primary-soft active:bg-primary-soft',
  danger: 'bg-error text-white hover:brightness-95 active:brightness-90',
  success: 'bg-success text-white hover:brightness-95',
  dark: 'bg-white/10 text-white hover:bg-white/15 active:bg-white/20',
}

export function Button({
  variant = 'primary', size = 'md', loading, success, icon, block, className, children, disabled, ...rest
}: { variant?: Variant; size?: 'sm' | 'md' | 'lg'; loading?: boolean; success?: boolean; icon?: IconName; block?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizes = { sm: 'h-9 px-3 text-[13px] gap-1.5 rounded-sm', md: 'h-11 px-4 text-sm gap-2 rounded-md', lg: 'h-14 px-5 text-[15px] gap-2 rounded-md' }
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center font-semibold transition-[background,filter,transform,opacity] duration-150 active:scale-[0.99] select-none',
        'disabled:bg-sunken disabled:text-disabled disabled:border-transparent disabled:shadow-none disabled:cursor-not-allowed',
        variants[success ? 'success' : variant], sizes[size], block && 'w-full', className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Dots /> : success ? <Icon name="check" size={18} strokeWidth={2.2} className="animate-pop" /> : icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}

function Dots() {
  return (
    <span className="inline-flex gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 rounded-full bg-current opacity-70 animate-[fade-up_600ms_ease-in-out_infinite_alternate]" style={{ animationDelay: `${i * 140}ms` }} />
      ))}
    </span>
  )
}

/* ---------- Inputs ---------- */
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-text-secondary">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-error"><Icon name="alert" size={14} />{error}</span>
      ) : hint ? <span className="mt-1.5 block text-[13px] text-text-muted">{hint}</span> : null}
    </label>
  )
}

export function Input({ invalid, className, ...rest }: { invalid?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        'h-12 w-full rounded-md border bg-surface px-3.5 text-[15px] text-text-primary placeholder:text-text-muted transition-colors outline-none',
        'focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-sunken disabled:text-disabled',
        invalid ? 'border-error ring-4 ring-error/10' : 'border-border-strong', className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}

export function Select({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <div className={cx('relative', className)}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-12 w-full appearance-none rounded-md border border-border-strong bg-surface pl-3.5 pr-10 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
    </div>
  )
}

export function OtpInput({ value, onChange, invalid }: { value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, ' ').split('').slice(0, 6)
  return (
    <div className="flex gap-2" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          aria-label={`Digit ${i + 1}`}
          value={d.trim()}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '')
            if (v.length > 1) { onChange(v.slice(0, 6)); refs.current[Math.min(v.length, 5)]?.focus(); return }
            const next = value.split(''); next[i] = v
            onChange(next.join('').slice(0, 6))
            if (v && i < 5) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => { if (e.key === 'Backspace' && !digits[i].trim() && i > 0) refs.current[i - 1]?.focus() }}
          className={cx(
            'h-14 w-full min-w-0 rounded-md border bg-surface text-center font-mono text-xl font-semibold outline-none transition-colors',
            'focus:border-primary focus:ring-4 focus:ring-primary/10',
            invalid ? 'border-error bg-error-soft/40' : d.trim() ? 'border-text-secondary' : 'border-border-strong',
          )}
        />
      ))}
    </div>
  )
}

/* ---------- Badges ---------- */
type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info'
const tones: Record<Tone, string> = {
  neutral: 'bg-sunken text-text-secondary', primary: 'bg-primary-soft text-primary', success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning', error: 'bg-error-soft text-error', info: 'bg-info-soft text-info',
}
export function Badge({ tone = 'neutral', dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold', tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

const bookingTone: Record<BookingStatus, [Tone, string]> = {
  requested: ['neutral', 'Requested'], accepted: ['primary', 'Confirmed'], waiting: ['warning', 'Waiting'], active: ['info', 'In progress'],
  completed: ['success', 'Completed'], cancelled: ['neutral', 'Cancelled'], disputed: ['error', 'Disputed'], refunded: ['warning', 'Refunded'],
}
export const BookingBadge = ({ status }: { status: BookingStatus }) => <Badge tone={bookingTone[status][0]} dot>{bookingTone[status][1]}</Badge>

const availTone: Record<TechAvailability, [Tone, string]> = { available: ['success', 'Available'], busy: ['warning', 'Busy'], offline: ['neutral', 'Offline'] }
export const AvailabilityBadge = ({ status }: { status: TechAvailability }) => <Badge tone={availTone[status][0]} dot>{availTone[status][1]}</Badge>

const payTone: Record<PaymentStatus, Tone> = { successful: 'success', pending: 'warning', refunded: 'info', failed: 'error' }
export const PaymentBadge = ({ status }: { status: PaymentStatus }) => <Badge tone={payTone[status]} dot>{status[0].toUpperCase() + status.slice(1)}</Badge>

const dispTone: Record<DisputeStatus, Tone> = { open: 'error', investigating: 'warning', resolved: 'success', closed: 'neutral' }
export const DisputeBadge = ({ status }: { status: DisputeStatus }) => <Badge tone={dispTone[status]} dot>{status[0].toUpperCase() + status.slice(1)}</Badge>

export function VerificationBadge({ status, compact }: { status: VerificationStatus; compact?: boolean }) {
  if (status === 'verified') return <Badge tone="primary"><Icon name="shield" size={13} strokeWidth={2} />{compact ? 'Verified' : 'Verified Technician'}</Badge>
  if (status === 'pending') return <Badge tone="warning"><Icon name="clock" size={13} strokeWidth={2} />Pending verification</Badge>
  if (status === 'suspended') return <Badge tone="error">Suspended</Badge>
  return <Badge tone="neutral">Rejected</Badge>
}

/* ---------- Avatar / Rating ---------- */
const avatarHues = ['#2b2f8f', '#3a4a6b', '#4b3a6b', '#2f5a5a', '#5a4a2f', '#6b3a4a']
export function Avatar({ initials, size = 44, ring, online }: { initials: string; size?: number; ring?: boolean; online?: boolean }) {
  const hue = avatarHues[(initials.charCodeAt(0) + initials.charCodeAt(1)) % avatarHues.length]
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cx('inline-flex items-center justify-center rounded-full font-semibold text-white', ring && 'ring-2 ring-white')}
        style={{ width: size, height: size, background: `linear-gradient(160deg, ${hue}, color-mix(in oklab, ${hue} 70%, black))`, fontSize: size * 0.36 }}
        aria-hidden
      >
        {initials}
      </span>
      {online !== undefined && (
        <span className={cx('absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-white', online ? 'bg-success' : 'bg-disabled')} />
      )}
    </span>
  )
}

export function Rating({ value, count, size = 'sm' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  if (!value) return <span className="text-[13px] text-text-muted">No ratings yet</span>
  return (
    <span className={cx('inline-flex items-center gap-1 font-semibold text-text-primary', size === 'md' ? 'text-[15px]' : 'text-[13px]')}>
      <Icon name="star" size={size === 'md' ? 16 : 14} className="fill-[#e3a008] text-[#e3a008]" strokeWidth={1} />
      {value.toFixed(1)}
      {count !== undefined && <span className="font-normal text-text-muted">· {count.toLocaleString('en-IN')} sessions</span>}
    </span>
  )
}

export function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const labels = ['Very poor', 'Poor', 'Okay', 'Good', 'Excellent']
  return (
    <div>
      <div className="flex gap-2" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className="rounded-md p-1 transition-transform active:scale-90">
            <Icon name="star" size={36} strokeWidth={1.3} className={cx('transition-colors', n <= value ? 'fill-[#e3a008] text-[#e3a008]' : 'text-border-strong')} />
          </button>
        ))}
      </div>
      <p className="mt-2 h-5 text-sm font-medium text-text-secondary">{value ? labels[value - 1] : ''}</p>
    </div>
  )
}

/* ---------- Tabs / chips ---------- */
export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cx('flex gap-1 rounded-md bg-sunken p-1', className)}>
      {tabs.map((t) => (
        <button
          key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={cx('flex h-9 flex-1 items-center justify-center gap-1.5 rounded-sm px-3 text-[13px] font-semibold transition-all', value === t.id ? 'bg-surface text-text-primary shadow-soft' : 'text-text-muted hover:text-text-secondary')}
        >
          {t.label}
          {t.count !== undefined && <span className="font-mono text-[11px] opacity-70">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Chip({ active, onClick, children, icon }: { active?: boolean; onClick?: () => void; children: ReactNode; icon?: IconName }) {
  return (
    <button
      onClick={onClick} aria-pressed={active}
      className={cx('inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors',
        active ? 'border-primary bg-primary text-white' : 'border-border-strong bg-surface text-text-secondary hover:border-text-muted')}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  )
}

/* ---------- Surfaces ---------- */
export function Card({ children, className, onClick, selected, unavailable }: { children: ReactNode; className?: string; onClick?: () => void; selected?: boolean; unavailable?: boolean }) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={cx('block w-full rounded-lg border bg-surface text-left transition-[border,box-shadow,opacity]',
        selected ? 'border-primary ring-4 ring-primary/10' : 'border-border',
        onClick && 'hover:border-border-strong hover:shadow-raised', unavailable && 'opacity-55', className)}
    >
      {children}
    </Comp>
  )
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{children}</h2>
      {action}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-md bg-sunken', className)} />
}

export function EmptyState({ icon = 'other', title, body, action }: { icon?: IconName; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border-strong px-6 py-10 text-center">
      <span className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-sunken text-text-muted"><Icon name={icon} size={22} /></span>
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 max-w-xs text-sm text-text-secondary">{body}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}

export function Notice({ tone = 'info', icon, children }: { tone?: Tone; icon?: IconName; children: ReactNode }) {
  return (
    <div className={cx('flex gap-2.5 rounded-md px-3.5 py-3 text-[13px] leading-relaxed', tones[tone])}>
      {icon && <Icon name={icon} size={16} className="mt-0.5 shrink-0" />}
      <div>{children}</div>
    </div>
  )
}

/* ---------- Timeline / Stepper ---------- */
export function Timeline({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const done = i < current, now = i === current
        return (
          <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && <span className={cx('absolute left-[11px] top-6 h-[calc(100%-16px)] w-0.5', done ? 'bg-success' : 'bg-border')} />}
            <span className={cx('relative z-10 inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
              done ? 'border-success bg-success text-white' : now ? 'border-primary bg-surface animate-pulse-ring' : 'border-border-strong bg-surface')}>
              {done ? <Icon name="check" size={13} strokeWidth={2.6} /> : now ? <span className="size-2 rounded-full bg-primary" /> : null}
            </span>
            <span className={cx('pt-0.5 text-sm', done ? 'text-text-secondary' : now ? 'font-semibold text-text-primary' : 'text-text-muted')}>{s}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function Stepper({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={cx('h-1 flex-1 rounded-full transition-colors duration-300', i <= current ? 'bg-primary' : 'bg-border')} />
      ))}
    </div>
  )
}

/* ---------- Payment summary ---------- */
export function PaymentSummary({ rows, total }: { rows: [string, string, string?][]; total: string }) {
  return (
    <dl className="divide-y divide-border rounded-lg border border-border bg-surface">
      {rows.map(([k, v, note]) => (
        <div key={k} className="flex items-baseline justify-between gap-4 px-4 py-3 text-sm">
          <dt className="text-text-secondary">{k}{note && <span className="block text-xs text-text-muted">{note}</span>}</dt>
          <dd className="font-mono font-medium tabular-nums">{v}</dd>
        </div>
      ))}
      <div className="flex items-baseline justify-between px-4 py-4">
        <dt className="font-semibold">Total</dt>
        <dd className="font-mono text-xl font-semibold tabular-nums">{total}</dd>
      </div>
    </dl>
  )
}

/* ---------- Modal / Sheet / Confirm ---------- */
export function Modal({ open, onClose, title, children, footer, side }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; side?: 'center' | 'bottom' | 'right' }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  const pos = side === 'right' ? 'justify-end' : side === 'bottom' ? 'items-end justify-center' : 'items-end justify-center sm:items-center'
  const panel = side === 'right'
    ? 'h-full w-full max-w-lg rounded-none animate-[fade-up_200ms_ease-out]'
    : 'w-full max-w-md rounded-t-lg sm:rounded-lg animate-fade-up max-h-[90vh]'
  return (
    <div className={cx('fixed inset-0 z-50 flex', pos)} role="dialog" aria-modal aria-label={title}>
      <button className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]" onClick={onClose} aria-label="Close" />
      <div className={cx('relative flex flex-col bg-surface shadow-raised', panel)}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted hover:bg-sunken" aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex gap-2 border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title, body, confirmLabel, danger, onConfirm, onClose }: { open: boolean; title: string; body: string; confirmLabel: string; danger?: boolean; onConfirm: () => void | Promise<void>; onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<>
        <Button variant="secondary" block onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} block loading={busy} onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); onClose() }}>{confirmLabel}</Button>
      </>}>
      <p className="text-sm leading-relaxed text-text-secondary">{body}</p>
    </Modal>
  )
}

/* ---------- Toast ---------- */
type ToastT = { id: number; text: string; tone: 'success' | 'error' | 'info' }
const ToastCtx = createContext<(text: string, tone?: ToastT['tone']) => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastT[]>([])
  const push = useCallback((text: string, tone: ToastT['tone'] = 'info') => {
    const id = Date.now() + Math.random()
    setItems((x) => [...x, { id, text, tone }])
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-md bg-ink px-4 py-3 text-sm font-medium text-white shadow-raised animate-fade-up">
            <Icon name={t.tone === 'success' ? 'check' : t.tone === 'error' ? 'alert' : 'bell'} size={16} className={t.tone === 'success' ? 'text-[#5fd39b]' : t.tone === 'error' ? 'text-[#ff8f86]' : 'text-[#9fa6f0]'} />
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------- Hooks ---------- */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true })
  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: undefined }))
    fn().then((data) => setState({ data, loading: false })).catch((e) => setState({ error: e.message, loading: false }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(run, [run])
  return { ...state, reload: run }
}
