import type { Booking, Device, Review, Technician } from '../types'
import { catalogService, rupee } from '../services'
import { Avatar, BookingBadge, Button, Card, Rating, VerificationBadge, cx } from './ui'
import { Icon } from './icons'

export function CategoryTile({ id, label, icon, onClick, compact }: { id: string; label: string; icon: Parameters<typeof Icon>[0]['name']; onClick: () => void; compact?: boolean }) {
  return (
    <button
      onClick={onClick}
      data-cat={id}
      className={cx('group flex flex-col items-center justify-center gap-2 rounded-md border border-border bg-surface transition-[border,background] hover:border-primary/40 hover:bg-primary-soft/50 active:bg-primary-soft',
        compact ? 'h-[84px]' : 'h-28')}
    >
      <span className="text-text-secondary transition-colors group-hover:text-primary"><Icon name={icon} size={compact ? 24 : 30} strokeWidth={1.4} /></span>
      <span className="text-[13px] font-semibold text-text-primary">{label}</span>
    </button>
  )
}

export function TechnicianCard({ t, onView, onBook }: { t: Technician; onView: () => void; onBook?: () => void }) {
  const unavailable = t.availability !== 'available'
  return (
    <Card className="p-4" unavailable={unavailable}>
      <div className="flex gap-3.5">
        <Avatar initials={t.initials} size={56} online={t.availability === 'available'} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[15px] font-bold leading-tight">{t.name}</p>
              <div className="mt-1"><VerificationBadge status={t.verification} /></div>
            </div>
            <div className="text-right">
              <p className="font-mono text-[17px] font-semibold tabular-nums">{rupee(t.remotePrice)}</p>
              <p className="text-[11px] text-text-muted">Remote session</p>
            </div>
          </div>
          <p className="mt-2.5 text-[13px] text-text-secondary">{t.skills.join(' • ')}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Rating value={t.rating} count={t.sessions} />
          </div>
          <p className={cx('mt-1.5 flex items-center gap-1.5 text-[13px]', unavailable ? 'text-warning' : 'text-success')}>
            <Icon name="clock" size={14} />
            {unavailable ? 'In a session — back in about 15 min' : `Usually responds in ${t.responseMins} min`}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" size="sm" block onClick={onView}>View Profile</Button>
        {onBook && <Button size="sm" block onClick={onBook} disabled={unavailable}>Book</Button>}
      </div>
    </Card>
  )
}

export function BookingCard({ b, onClick }: { b: Booking; onClick?: () => void }) {
  const cat = catalogService.category(b.category)
  return (
    <Card className="p-4" onClick={onClick}>
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-sunken text-text-secondary"><Icon name={cat.icon} size={20} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug">{b.problem}</p>
            <BookingBadge status={b.status} />
          </div>
          <p className="mt-1 text-[13px] text-text-muted">{b.device} · {b.service === 'remote' ? 'Remote' : 'In-person visit'}</p>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[13px]">
            <span className="text-text-secondary">{b.technicianName} · {b.date}, {b.time}</span>
            <span className="font-mono font-semibold tabular-nums">{b.amount ? rupee(b.amount) : '—'}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function DeviceCard({ d }: { d: Device }) {
  const cat = catalogService.category(d.category)
  return (
    <Card className="flex items-center gap-3.5 p-4">
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary"><Icon name={cat.icon} size={24} strokeWidth={1.4} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{d.brand}</p>
        <p className="font-semibold">{d.model}</p>
        <p className="mt-0.5 text-[13px] text-text-muted">{d.lastSession ? `Last support: ${d.lastSession}` : 'No support sessions yet'}</p>
      </div>
      <Icon name="chevronRight" size={18} className="text-text-muted" />
    </Card>
  )
}

export function ReviewCard({ r }: { r: Review }) {
  return (
    <div className="border-b border-border py-4 last:border-0">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{r.author}</p>
        <span className="text-xs text-text-muted">{r.date}</span>
      </div>
      <div className="mt-1 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="star" size={13} strokeWidth={1} className={i < r.rating ? 'fill-[#e3a008] text-[#e3a008]' : 'text-border-strong'} />)}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{r.text}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">{r.tags.map((t) => <span key={t} className="rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium text-text-secondary">{t}</span>)}</div>
    </div>
  )
}

export function TechSummary({ t, trailing }: { t: Technician; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar initials={t.initials} size={48} />
      <div className="min-w-0 flex-1">
        <p className="font-bold leading-tight">{t.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2"><VerificationBadge status={t.verification} compact /><Rating value={t.rating} /></div>
      </div>
      {trailing}
    </div>
  )
}
