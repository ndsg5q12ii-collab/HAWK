import { useEffect, useState } from 'react'
import { Icon } from '../../components/icons'
import { AvailabilityBadge, Avatar, Badge, BookingBadge, Button, Card, ConfirmDialog, EmptyState, Field, Input, Modal, Notice, Rating, SectionLabel, Skeleton, Stepper, Tabs, VerificationBadge, cx, useAsync, useToast } from '../../components/ui'
import { VideoStage, useTimer } from '../../components/VideoStage'
import { MobileShell, Screen, StickyAction, TopBar } from '../../layouts/MobileLayout'
import { Link, useRouter } from '../../lib/router'
import { bookingService, catalogService, rupee, technicianService } from '../../services'
import { PRICING } from '../../services/mock/data'
import { useApp } from '../../state/AppState'
import type { TechRequest } from '../../types'
import { TECH_NAV } from '../customer/nav'

const ME = 't-rahul'

function StatusBar() {
  const { techAvailability, setTechAvailability } = useApp()
  const on = techAvailability === 'available'
  return (
    <div className={cx('flex items-center gap-3 px-5 py-4 transition-colors duration-300', on ? 'bg-success text-white' : 'bg-ink-3 text-white')}>
      <span className={cx('size-3 rounded-full', on ? 'bg-white animate-pulse-ring' : 'bg-white/40')} />
      <div className="flex-1">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">{on ? 'Available' : 'Offline'}</p>
        <p className="text-[15px] font-bold">{on ? "You're available" : "You're offline — no new requests"}</p>
      </div>
      <button role="switch" aria-checked={on} aria-label="Availability" onClick={() => setTechAvailability(on ? 'offline' : 'available')}
        className={cx('relative h-8 w-14 rounded-full transition-colors', on ? 'bg-white/30' : 'bg-white/15')}>
        <span className={cx('absolute top-1 size-6 rounded-full bg-white shadow transition-transform duration-200', on ? 'translate-x-7' : 'translate-x-1')} />
      </button>
    </div>
  )
}

export function TechHome() {
  const { navigate } = useRouter()
  const { techAvailability, techAccepted } = useApp()
  const { data: reqs } = useAsync(() => technicianService.requests())
  const { data: bookings, loading } = useAsync(() => bookingService.forTechnician(ME))
  const pending = reqs?.filter((r) => !techAccepted.includes(r.id)) ?? []
  const upcoming = bookings?.filter((b) => ['accepted', 'requested', 'active'].includes(b.status)) ?? []
  const done = bookings?.filter((b) => b.status === 'completed' && b.date === 'Today') ?? []
  return (
    <MobileShell nav={TECH_NAV}>
      <StatusBar />
      <Screen className="gap-6">
        <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-surface">
          {[['Today', rupee(1240)], ['Sessions', '6'], ['Rating', '4.8']].map(([k, v]) => (
            <div key={k} className="px-3 py-3"><p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{k}</p><p className="mt-1 font-mono text-lg font-semibold">{v}</p></div>
          ))}
        </div>

        <section>
          <SectionLabel action={<Link to="/technician/requests" className="text-xs font-semibold text-primary">All requests</Link>}>Active request</SectionLabel>
          {techAvailability !== 'available' ? <EmptyState icon="bell" title="Go available to receive requests" body="Toggle the switch at the top when you're ready." />
            : pending[0] ? (
              <Card className="p-4" onClick={() => navigate('/technician/requests')}>
                <div className="flex items-center justify-between"><Badge tone="warning" dot>New · {pending.length} waiting</Badge><span className="font-mono font-semibold">{rupee(pending[0].price)}</span></div>
                <p className="mt-3 line-clamp-2 text-sm font-medium">{pending[0].problem}</p>
                <p className="mt-1 text-[13px] text-text-muted">{pending[0].device} · {pending[0].area}</p>
              </Card>
            ) : <EmptyState icon="check" title="No new requests" body="We'll notify you as soon as one comes in." />}
        </section>

        <section>
          <SectionLabel>Upcoming</SectionLabel>
          <div className="divide-y divide-border rounded-lg border border-border bg-surface">
            {loading ? <Skeleton className="m-3 h-14" /> : upcoming.map((b) => (
              <button key={b.id} onClick={() => navigate('/technician/bookings')} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sunken/50">
                <div className="w-16 font-mono text-[13px] font-semibold">{b.time}<p className="text-[11px] font-normal text-text-muted">{b.date}</p></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{b.device}</p><p className="truncate text-xs text-text-muted">{b.service === 'visit' ? `Visit · ${b.area}` : 'Remote'}</p></div>
                <BookingBadge status={b.status} />
              </button>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>Today's sessions · {done.length + 5}</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/technician/requests')}>Requests</Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/technician/bookings')}>Schedule</Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/technician/earnings')}>Earnings</Button>
          </div>
        </section>
      </Screen>
    </MobileShell>
  )
}

function RequestCard({ r, onAccept, onDecline }: { r: TechRequest; onAccept: () => void; onDecline: () => void }) {
  const [left, setLeft] = useState(60)
  useEffect(() => {
    if (left <= 0) { onDecline(); return }
    const t = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(t)
  }, [left, onDecline])
  const cat = catalogService.category(r.category)
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-raised animate-fade-up">
      <div className="h-1 bg-sunken"><div className="h-full bg-primary transition-[width] duration-1000 ease-linear" style={{ width: `${(left / 60) * 100}%` }} /></div>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary"><Icon name={cat.icon} size={22} /></span>
            <div><p className="font-bold">{r.device}</p><p className="text-[13px] text-text-muted">{cat.label} · {r.area}</p></div>
          </div>
          <span className="font-mono text-xs text-text-muted">{left}s</span>
        </div>
        <blockquote className="mt-4 rounded-md bg-sunken p-3.5 text-[15px] leading-relaxed">"{r.problem}"</blockquote>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div><dt className="text-[11px] uppercase tracking-wider text-text-muted">Type</dt><dd className="font-semibold">{r.service === 'remote' ? 'Remote' : 'Visit'}</dd></div>
          <div><dt className="text-[11px] uppercase tracking-wider text-text-muted">Est.</dt><dd className="font-mono font-semibold">{r.estMins} min</dd></div>
          <div><dt className="text-[11px] uppercase tracking-wider text-text-muted">You earn</dt><dd className="font-mono font-semibold">{rupee(Math.round(r.price * (1 - PRICING.commissionRate)))}</dd></div>
        </dl>
        <p className="mt-2 text-[12px] text-text-muted">Customer pays {rupee(r.price)} · {r.photos ? `${r.photos} photos attached` : 'No photos'} · Customer: {r.customer}</p>
        <div className="mt-5 grid grid-cols-[1fr_1.6fr] gap-2">
          <Button variant="secondary" size="lg" onClick={onDecline}>Decline</Button>
          <Button size="lg" onClick={onAccept}>Accept</Button>
        </div>
      </div>
    </div>
  )
}

export function TechRequests() {
  const { navigate } = useRouter()
  const toast = useToast()
  const { techAvailability, techAccepted, acceptRequest } = useApp()
  const { data, loading } = useAsync(() => technicianService.requests())
  const [declined, setDeclined] = useState<string[]>([])
  const list = data?.filter((r) => !techAccepted.includes(r.id) && !declined.includes(r.id)) ?? []
  return (
    <MobileShell nav={TECH_NAV}>
      <StatusBar />
      <Screen className="gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Requests</h1>
        {techAvailability !== 'available' ? <EmptyState icon="bell" title="You're offline" body="Go available to start receiving requests." />
          : loading ? <Skeleton className="h-80" />
          : list.length === 0 ? <EmptyState icon="check" title="You're all caught up" body="New requests appear here instantly." />
          : list.map((r) => (
            <RequestCard key={r.id} r={r}
              onDecline={() => { setDeclined((d) => [...d, r.id]); toast('Request passed to another technician') }}
              onAccept={() => { acceptRequest(r.id); toast('Accepted. Customer has been notified.', 'success'); navigate(`/technician/session/${r.id}`) }} />
          ))}
      </Screen>
    </MobileShell>
  )
}

export function TechSession({ id }: { id: string }) {
  const { navigate } = useRouter()
  const toast = useToast()
  const req = (useAsync(() => technicianService.requests()).data ?? []).find((r) => r.id === id)
  const [phase, setPhase] = useState<'pre' | 'live' | 'done'>('pre')
  const [notes, setNotes] = useState('')
  const [notesOpen, setNotesOpen] = useState(false)
  const [escalate, setEscalate] = useState(false)
  const [outcome, setOutcome] = useState<'resolved' | 'escalated' | null>(null)
  const time = useTimer(phase === 'live')

  if (!req) return <MobileShell><TopBar /><Screen><Skeleton className="h-64" /></Screen></MobileShell>
  const cat = catalogService.category(req.category)

  if (phase === 'pre') return (
    <MobileShell>
      <TopBar title="Before you join" sub={req.id} />
      <Screen className="gap-5">
        <div className="flex items-center gap-3"><Avatar initials={req.customer.slice(0, 2).toUpperCase()} size={48} /><div><p className="font-bold">{req.customer}</p><p className="text-[13px] text-text-muted">{req.area} · Contact via Setu only</p></div></div>
        <dl className="divide-y divide-border rounded-lg border border-border bg-surface text-sm">
          {[['Device', `${req.device} (${cat.label})`], ['Session', 'Remote video'], ['Estimate', `${req.estMins} min`], ['Price', rupee(req.price)]].map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-3"><dt className="text-text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>))}
        </dl>
        <section><SectionLabel>Customer's description</SectionLabel><p className="rounded-md bg-sunken p-4 text-[15px] leading-relaxed">"{req.problem}"</p></section>
        <section><SectionLabel>Photos</SectionLabel>
          {req.photos ? <div className="grid grid-cols-3 gap-2">{Array.from({ length: req.photos }).map((_, i) => (
            <div key={i} className="flex aspect-square items-center justify-center rounded-md bg-ink-2 text-white/40"><Icon name="image" size={22} /></div>))}</div>
            : <p className="text-sm text-text-muted">No photos attached.</p>}
        </section>
      </Screen>
      <StickyAction><Button size="lg" block icon="video" onClick={() => setPhase('live')}>Start Session</Button></StickyAction>
    </MobileShell>
  )

  if (phase === 'done') return (
    <MobileShell>
      <Screen className="items-center justify-center text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-success text-white animate-pop"><Icon name={outcome === 'escalated' ? 'mapPin' : 'check'} size={30} strokeWidth={2.2} /></span>
        <h1 className="mt-5 text-2xl font-extrabold">{outcome === 'escalated' ? 'Visit requested' : 'Marked as resolved'}</h1>
        <p className="mt-2 max-w-xs text-text-secondary">{outcome === 'escalated' ? 'The customer will pick a time. The visit will appear in your bookings.' : `Session ${time}. You'll earn ${rupee(Math.round(req.price * 0.8))} once the customer confirms.`}</p>
        {notes && <p className="mt-4 max-w-xs rounded-md bg-sunken p-3 text-left text-[13px] text-text-secondary"><span className="font-semibold">Your notes:</span> {notes}</p>}
        <div className="mt-8 flex w-full flex-col gap-2"><Button size="lg" onClick={() => navigate('/technician/earnings')}>View Earnings</Button><Button variant="secondary" size="lg" onClick={() => navigate('/technician/home')}>Back to home</Button></div>
      </Screen>
    </MobileShell>
  )

  return (
    <MobileShell dark>
      <VideoStage
        remote={{ name: req.customer, initials: req.customer.slice(0, 2).toUpperCase(), caption: 'Customer camera on' }}
        selfInitials="RK"
        onChat={() => toast('Chat opens here')}
        onEnd={() => { setOutcome('resolved'); setPhase('done') }}
        header={<>
          <div><p className="font-semibold">{req.customer}</p><p className="font-mono text-xs text-white/60">{time} · {req.device}</p></div>
          <Badge tone="info">{cat.label}</Badge>
        </>}
        side={
          <div className="mx-3 mt-3 grid grid-cols-3 gap-2">
            <Button variant="dark" size="sm" icon="note" onClick={() => setNotesOpen(true)}>Notes</Button>
            <Button variant="dark" size="sm" icon="check" onClick={() => { setOutcome('resolved'); setPhase('done') }}>Resolved</Button>
            <Button variant="dark" size="sm" icon="mapPin" onClick={() => setEscalate(true)}>Escalate</Button>
          </div>
        }
      />
      <Modal open={notesOpen} onClose={() => setNotesOpen(false)} title="Session notes" footer={<Button block onClick={() => { setNotesOpen(false); toast('Notes saved', 'success') }}>Save notes</Button>}>
        <textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you check or change? Customers and support can see this." className="w-full rounded-md border border-border-strong p-3 text-sm outline-none focus:border-primary" />
      </Modal>
      <ConfirmDialog open={escalate} onClose={() => setEscalate(false)} title="Escalate to an in-person visit?" confirmLabel="Request visit"
        body="The customer will be asked to book a visit. Today's remote session will not be charged to them."
        onConfirm={() => { setOutcome('escalated'); setPhase('done') }} />
    </MobileShell>
  )
}

export function TechBookings() {
  const toast = useToast()
  const { data, loading } = useAsync(() => bookingService.forTechnician(ME))
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const list = data?.filter((b) => (tab === 'upcoming' ? ['accepted', 'requested', 'active', 'waiting'] : ['completed', 'cancelled', 'refunded']).includes(b.status)) ?? []
  return (
    <MobileShell nav={TECH_NAV}>
      <Screen className="gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Bookings</h1>
        <Tabs value={tab} onChange={setTab} tabs={[{ id: 'upcoming', label: 'Upcoming' }, { id: 'past', label: 'Past' }]} />
        {loading ? <Skeleton className="h-40" /> : list.length === 0 ? <EmptyState icon="calendar" title="Nothing here yet" /> : list.map((b) => (
          <Card key={b.id} className="p-4">
            <div className="flex items-start justify-between"><div><p className="font-mono text-xs text-text-muted">{b.id}</p><p className="mt-0.5 font-bold">{b.device}</p></div><BookingBadge status={b.status} /></div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              <div><dt className="text-text-muted">Customer</dt><dd className="font-medium">{b.customer.split(' ')[0]} {b.customer.split(' ')[1]?.[0]}.</dd></div>
              <div><dt className="text-text-muted">When</dt><dd className="font-medium">{b.date}, {b.time}</dd></div>
              <div><dt className="text-text-muted">Service</dt><dd className="font-medium">{b.service === 'visit' ? 'In-person visit' : 'Remote'}</dd></div>
              <div><dt className="text-text-muted">Payment</dt><dd className="font-mono font-medium">{rupee(b.amount)}</dd></div>
              {b.service === 'visit' && <div className="col-span-2"><dt className="text-text-muted">Address</dt><dd className="font-medium">Sector 54, {b.area} <span className="text-text-muted">(full address shown on the day)</span></dd></div>}
            </dl>
            {b.service === 'visit' && b.status !== 'completed' && <Button block size="sm" icon="navigation" className="mt-4" onClick={() => toast('Opening directions in Google Maps…')}>Navigate</Button>}
          </Card>
        ))}
      </Screen>
    </MobileShell>
  )
}

const PERIODS = { today: { gross: 1550, sessions: 6 }, week: { gross: 8940, sessions: 34 }, month: { gross: 32460, sessions: 128 } }
const TXNS = [
  ['STU-48228', 'MacBook Air · Remote', 'Today', 249], ['STU-48230', 'Custom PC · Visit', 'Today', 449], ['STU-48102', 'iPhone 14 · Remote', '28 Sep', 249],
  ['STU-48055', 'HP Pavilion · Remote', '27 Sep', 199], ['STU-47990', 'Dell Inspiron · Visit', '26 Sep', 449],
] as const

export function TechEarnings() {
  const [p, setP] = useState<keyof typeof PERIODS>('today')
  const d = PERIODS[p]
  const ded = Math.round(d.gross * PRICING.commissionRate)
  return (
    <MobileShell nav={TECH_NAV}>
      <Screen className="gap-5">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold tracking-tight">Earnings</h1><Badge tone="warning">Mock data</Badge></div>
        <Tabs value={p} onChange={setP} tabs={[{ id: 'today', label: 'Today' }, { id: 'week', label: 'This week' }, { id: 'month', label: 'This month' }]} />
        <div className="rounded-lg bg-ink p-5 text-white">
          <p className="text-[13px] text-white/60">Net earnings</p>
          <p className="mt-1 font-mono text-4xl font-semibold tabular-nums">{rupee(d.gross - ded)}</p>
          <p className="mt-1 text-[13px] text-white/50">{d.sessions} sessions</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-sm">
            <div><dt className="text-white/50">Gross</dt><dd className="font-mono font-medium">{rupee(d.gross)}</dd></div>
            <div><dt className="text-white/50">Platform ({PRICING.commissionRate * 100}%)</dt><dd className="font-mono font-medium text-[#ffb3ad]">−{rupee(ded)}</dd></div>
          </dl>
        </div>
        <Notice icon="wallet">Next payout every Monday to HDFC ••••4417.</Notice>
        <section><SectionLabel>Transactions</SectionLabel>
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {TXNS.map(([id, label, date, amt]) => (
              <li key={id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div><p className="font-medium">{label}</p><p className="font-mono text-xs text-text-muted">{id} · {date}</p></div>
                <div className="text-right"><p className="font-mono font-semibold">+{rupee(Math.round(amt * 0.8))}</p><p className="font-mono text-[11px] text-text-muted">of {rupee(amt)}</p></div>
              </li>
            ))}
          </ul></section>
      </Screen>
    </MobileShell>
  )
}

export function TechProfile() {
  const { navigate } = useRouter()
  const toast = useToast()
  const t = technicianService.get(ME)!
  const { techAvailability } = useApp()
  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
  return (
    <MobileShell nav={TECH_NAV}>
      <Screen className="gap-6">
        <div className="flex items-center gap-4">
          <Avatar initials={t.initials} size={72} online={techAvailability === 'available'} />
          <div><h1 className="text-xl font-bold">{t.name}</h1><div className="mt-1.5 flex flex-wrap gap-2"><VerificationBadge status={t.verification} /><AvailabilityBadge status={techAvailability} /></div></div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-surface py-3 text-center">
          <div><Rating value={t.rating} /><p className="text-[11px] text-text-muted">Rating</p></div>
          <div><p className="font-mono font-semibold">{t.sessions}</p><p className="text-[11px] text-text-muted">Sessions</p></div>
          <div><p className="font-mono font-semibold">{t.experienceYears} yrs</p><p className="text-[11px] text-text-muted">Experience</p></div>
        </div>
        <section><SectionLabel>Skills & devices</SectionLabel><div className="flex flex-wrap gap-2">{t.skills.map((s) => <Badge key={s}>{s}</Badge>)}{t.categories.map((c) => <Badge key={c} tone="primary">{catalogService.category(c).label}</Badge>)}</div></section>
        <section><SectionLabel>Working days</SectionLabel>
          <div className="grid grid-cols-7 gap-1.5">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => {
            const on = days.includes(d)
            return <button key={d} aria-pressed={on} onClick={() => setDays(on ? days.filter((x) => x !== d) : [...days, d])} className={cx('h-11 rounded-sm text-xs font-semibold', on ? 'bg-primary text-white' : 'bg-sunken text-text-muted')}>{d}</button>
          })}</div>
          <p className="mt-2 font-mono text-[13px] text-text-secondary">10:00 AM – 8:00 PM</p></section>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" block onClick={() => toast('Availability saved', 'success')}>Save availability</Button>
          <Button variant="ghost" block onClick={() => navigate('/technician/onboarding')}>Preview new-technician onboarding</Button>
        </div>
      </Screen>
    </MobileShell>
  )
}

const OB_STEPS = ['Personal information', 'Skills', 'Device expertise', 'Experience', 'Identity verification', 'Availability', 'Payout details', 'Review']

export function TechOnboarding() {
  const { navigate } = useRouter()
  const [i, setI] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const toggle = (x: string) => setPicked((p) => (p.includes(x) ? p.filter((y) => y !== x) : [...p, x]))
  if (submitted) return (
    <MobileShell>
      <Screen className="items-center justify-center text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-warning-soft text-warning"><Icon name="clock" size={30} /></span>
        <h1 className="mt-5 text-2xl font-extrabold">Application submitted</h1>
        <div className="mt-3"><VerificationBadge status="pending" /></div>
        <p className="mt-4 max-w-xs text-text-secondary">We usually review applications within 2 working days. You can't take bookings until you're verified.</p>
        <Button size="lg" block className="mt-8" onClick={() => navigate('/technician/home')}>Done</Button>
      </Screen>
    </MobileShell>
  )
  const step = OB_STEPS[i]
  return (
    <MobileShell>
      <TopBar title="Become a Setu technician" sub={`Step ${i + 1} of ${OB_STEPS.length}`} onBack={() => (i ? setI(i - 1) : navigate('/technician/profile'))} />
      <div className="px-5 pt-4"><Stepper total={OB_STEPS.length} current={i} /></div>
      <Screen key={i} className="gap-5">
        <h1 className="text-2xl font-extrabold tracking-tight">{step}</h1>
        {i === 0 && <><Field label="Full name"><Input placeholder="As on your ID" /></Field><Field label="City"><Input placeholder="Noida" /></Field></>}
        {(i === 1 || i === 2) && <div className="flex flex-wrap gap-2">{(i === 1 ? ['Windows', 'macOS', 'Android', 'iOS', 'Networking', 'Hardware repair', 'Data recovery', 'Printers'] : catalogService.categories().map((c) => c.label)).map((s) => (
          <button key={s} onClick={() => toggle(s)} aria-pressed={picked.includes(s)} className={cx('h-10 rounded-full border px-4 text-sm font-semibold', picked.includes(s) ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong bg-surface')}>{s}</button>))}</div>}
        {i === 3 && <><Field label="Years of experience"><Input inputMode="numeric" placeholder="5" /></Field><Field label="Where have you worked?" hint="Shops, service centres or freelance"><Input placeholder="e.g. Dell service partner, Nehru Place" /></Field></>}
        {i === 4 && <><Notice icon="lock">Your documents are encrypted and only seen by our verification team. Customers never see them.</Notice>
          {['Aadhaar or PAN card', 'Selfie for face match', 'Address proof'].map((d) => <Card key={d} className="flex items-center justify-between p-4"><span className="text-sm font-medium">{d}</span><Button size="sm" variant="secondary" icon="camera">Upload</Button></Card>)}</>}
        {i === 5 && <p className="text-sm text-text-secondary">Choose your usual working hours. You can change these any time and go offline whenever you want.</p>}
        {i === 6 && <><Field label="Account holder name"><Input /></Field><Field label="Account number"><Input inputMode="numeric" className="font-mono" /></Field><Field label="IFSC"><Input className="font-mono uppercase" placeholder="HDFC0001234" /></Field></>}
        {i === 7 && <ul className="divide-y divide-border rounded-lg border border-border bg-surface">{OB_STEPS.slice(0, 7).map((s) => <li key={s} className="flex items-center justify-between px-4 py-3 text-sm">{s}<Icon name="check" size={16} className="text-success" /></li>)}</ul>}
      </Screen>
      <StickyAction><Button size="lg" block onClick={() => (i < OB_STEPS.length - 1 ? setI(i + 1) : setSubmitted(true))}>{i < OB_STEPS.length - 1 ? 'Continue' : 'Submit for verification'}</Button></StickyAction>
    </MobileShell>
  )
}
