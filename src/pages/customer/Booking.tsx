import { useEffect, useState } from 'react'
import { TechSummary } from '../../components/domain'
import { Icon } from '../../components/icons'
import { Avatar, BookingBadge, Button, ConfirmDialog, EmptyState, Modal, Notice, SectionLabel, Tabs, Timeline, VerificationBadge, cx, useToast } from '../../components/ui'
import { MobileShell, Screen, StickyAction, TopBar } from '../../layouts/MobileLayout'
import { useRouter } from '../../lib/router'
import { bookingService, catalogService, rupee, technicianService } from '../../services'
import { useApp } from '../../state/AppState'

const SLOTS = ['10:00 AM', '11:30 AM', '1:00 PM', '3:30 PM', '5:00 PM', '6:30 PM', '8:00 PM']
const TAKEN = ['1:00 PM', '5:00 PM']
const days = () => Array.from({ length: 5 }).map((_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i)
  return { key: i, top: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-IN', { weekday: 'short' }), num: d.getDate(), label: i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
})

export function BookingPage() {
  const { navigate } = useRouter()
  const { technicianId, draft, setBooking } = useApp()
  const t = technicianService.get(technicianId ?? 't-rahul')!
  const [mode, setMode] = useState<'now' | 'schedule'>('now')
  const [day, setDay] = useState(0)
  const [slot, setSlot] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const D = days()
  const problem = draft.description.trim() || 'Laptop not connecting to Wi-Fi'

  const confirm = async (simulateFail = false) => {
    setBusy(true); setFailed(false)
    if (simulateFail) { await new Promise((r) => setTimeout(r, 700)); setBusy(false); setFailed(true); return }
    const b = await bookingService.create({
      customer: 'Niladri Sen', technicianId: t.id, technicianName: t.name, category: draft.category,
      device: [draft.brand, draft.model].filter(Boolean).join(' ') || catalogService.category(draft.category).label,
      problem: problem.length > 60 ? problem.slice(0, 57) + '…' : problem, service: 'remote',
      date: mode === 'now' ? 'Today' : D[day].label, time: mode === 'now' ? 'Now' : slot!, status: 'accepted', amount: t.remotePrice, area: 'Noida',
    })
    setBooking(b); setBusy(false)
    navigate('/booking/confirmed')
  }

  return (
    <MobileShell>
      <TopBar title="Review booking" />
      <Screen className="gap-6">
        <TechSummary t={t} />
        <dl className="divide-y divide-border rounded-lg border border-border bg-surface text-sm">
          {[
            ['Problem', problem],
            ['Technician', t.name],
            ['Service', 'Remote Technical Support'],
            ['Duration', 'Usually 15–30 min (estimate)'],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[96px_1fr] gap-3 px-4 py-3"><dt className="text-text-muted">{k}</dt><dd className="line-clamp-2 font-medium">{v}</dd></div>
          ))}
          <div className="grid grid-cols-[96px_1fr] items-baseline gap-3 px-4 py-3.5"><dt className="text-text-muted">Price</dt><dd className="font-mono text-lg font-semibold">{rupee(t.remotePrice)} <span className="font-sans text-xs font-normal text-text-muted">+ fees shown at payment</span></dd></div>
        </dl>

        <section>
          <SectionLabel>When?</SectionLabel>
          <Tabs value={mode} onChange={setMode} tabs={[{ id: 'now', label: 'Connect Now' }, { id: 'schedule', label: 'Schedule' }]} />
          {mode === 'now' ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-success"><span className="size-2 rounded-full bg-success animate-pulse-ring" />{t.name.split(' ')[0]} can join in about {t.responseMins} min</p>
          ) : (
            <div className="mt-4 animate-fade-up">
              <div className="grid grid-cols-5 gap-2">
                {D.map((d) => (
                  <button key={d.key} onClick={() => { setDay(d.key); setSlot(null) }} aria-pressed={day === d.key}
                    className={cx('flex h-16 flex-col items-center justify-center rounded-md border text-xs font-semibold transition-colors', day === d.key ? 'border-primary bg-primary text-white' : 'border-border bg-surface hover:border-border-strong')}>
                    <span className={day === d.key ? 'text-white/70' : 'text-text-muted'}>{d.top}</span><span className="mt-0.5 font-mono text-base">{d.num}</span>
                  </button>
                ))}
              </div>
              <p className="mb-2 mt-5 text-[13px] font-semibold text-text-secondary">Available time slots</p>
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((s) => {
                  const taken = day === 0 && TAKEN.includes(s)
                  return (
                    <button key={s} disabled={taken} onClick={() => setSlot(s)} aria-pressed={slot === s}
                      className={cx('h-11 rounded-sm border font-mono text-[13px] font-medium transition-colors',
                        taken ? 'border-border bg-sunken text-disabled line-through' : slot === s ? 'border-primary bg-primary-soft text-primary ring-2 ring-primary/20' : 'border-border bg-surface hover:border-border-strong')}>
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </section>
        {failed && <Notice tone="error" icon="alert">We couldn't confirm this booking — {t.name.split(' ')[0]} just became busy. Nothing was charged. Try again or pick another time.</Notice>}
        <Notice icon="clock">Free cancellation up to 10 minutes before the session. You pay only after the session ends.</Notice>
      </Screen>
      <StickyAction>
        <Button size="lg" block loading={busy} disabled={mode === 'schedule' && !slot} onClick={() => confirm()}>{mode === 'now' ? 'Confirm Booking' : 'Continue'}</Button>
        <button onClick={() => confirm(true)} className="mt-2 block w-full text-center font-mono text-[11px] text-text-muted underline">Demo: simulate booking failure</button>
      </StickyAction>
    </MobileShell>
  )
}

export function Confirmed() {
  const { navigate } = useRouter()
  const { booking } = useApp()
  if (!booking) return <MobileShell><Screen><EmptyState title="No booking in progress" action={<Button onClick={() => navigate('/home')}>Go home</Button>} /></Screen></MobileShell>
  return (
    <MobileShell>
      <Screen className="items-center pt-14 text-center">
        <span className="inline-flex size-20 items-center justify-center rounded-full bg-success-soft animate-pop">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-success text-white"><Icon name="check" size={30} strokeWidth={2.4} /></span>
        </span>
        <h1 className="mt-6 text-[26px] font-extrabold tracking-tight">Booking confirmed</h1>
        <p className="mt-2 text-[15px] text-text-secondary">{booking.technicianName} has your problem details and will be ready.</p>
        <dl className="mt-8 w-full divide-y divide-border rounded-lg border border-border bg-surface text-left text-sm">
          {[['Technician', booking.technicianName], ['Date', booking.date], ['Time', booking.time === 'Now' ? 'Starting now' : booking.time], ['Service', 'Remote Technical Support'], ['Price', rupee(booking.amount)], ['Booking ID', booking.id]].map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-3"><dt className="text-text-muted">{k}</dt><dd className={cx('font-medium', (k === 'Price' || k === 'Booking ID') && 'font-mono')}>{v}</dd></div>
          ))}
        </dl>
        <p className="mt-4 text-left text-[13px] leading-relaxed text-text-muted">Cancel for free until 10 minutes before. Later cancellations may be charged ₹49 to cover the technician's time.</p>
      </Screen>
      <StickyAction>
        <Button size="lg" block icon="video" onClick={() => navigate(`/waiting/${booking.id}`)}>Join Session</Button>
        <Button variant="ghost" block className="mt-2" onClick={() => navigate(`/booking/${booking.id}`)}>View Booking</Button>
      </StickyAction>
    </MobileShell>
  )
}

export function Waiting({ id }: { id: string }) {
  const { navigate } = useRouter()
  const toast = useToast()
  const b = bookingService.get(id)
  const t = technicianService.get(b?.technicianId ?? 't-rahul')!
  const [secs, setSecs] = useState(6)
  const [cancel, setCancel] = useState(false)
  const [msg, setMsg] = useState(false)
  const [techCancelled, setTechCancelled] = useState(false)
  useEffect(() => {
    if (techCancelled) return
    if (secs <= 0) { navigate(`/session/${id}`); return }
    const x = setTimeout(() => setSecs(secs - 1), 1000)
    return () => clearTimeout(x)
  }, [secs, id, navigate, techCancelled])

  return (
    <MobileShell dark>
      <div className="flex flex-1 flex-col items-center px-6 pb-8 pt-20 text-center text-white">
        {techCancelled ? (
          <div className="animate-fade-up">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-white/10 text-[#ffb36b]"><Icon name="alert" size={26} /></span>
            <h1 className="mt-5 text-2xl font-bold">{t.name.split(' ')[0]} had to cancel</h1>
            <p className="mt-2 text-white/60">Something urgent came up. You haven't been charged. We can find you someone else right away.</p>
            <div className="mt-8 flex flex-col gap-2"><Button size="lg" onClick={() => navigate('/matching')}>Find another technician</Button><Button variant="dark" size="lg" onClick={() => navigate('/home')}>Back to home</Button></div>
          </div>
        ) : (
          <>
            <span className="relative"><span className="absolute -inset-3 rounded-full border border-white/10 animate-pulse" /><Avatar initials={t.initials} size={96} /></span>
            <p className="mt-6 text-2xl font-bold">{t.name.split(' ')[0]} is joining…</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-white/60"><Icon name="shield" size={14} className="text-[#9fa6f0]" />Verified Technician · ★ {t.rating}</div>
            <p className="mt-8 font-mono text-sm text-white/50">Estimated wait</p>
            <p className="font-mono text-4xl font-semibold tabular-nums">0:{String(secs).padStart(2, '0')}</p>
            <p className="mt-6 max-w-[260px] text-sm text-white/50">Keep your device nearby. Check that your camera and microphone are allowed.</p>
            <div className="mt-auto flex w-full gap-2 pt-10">
              <Button variant="dark" size="lg" className="flex-1" icon="message" onClick={() => setMsg(true)}>Message</Button>
              <Button variant="dark" size="lg" className="flex-1 !text-[#ff8f86]" onClick={() => setCancel(true)}>Cancel</Button>
            </div>
            <button onClick={() => setTechCancelled(true)} className="mt-4 font-mono text-[11px] text-white/40 underline">Demo: technician cancels</button>
          </>
        )}
      </div>
      <Modal open={msg} onClose={() => setMsg(false)} title={`Message ${t.name.split(' ')[0]}`}>
        <div className="flex flex-col gap-2">
          {['I am ready', 'Give me 2 minutes', 'My camera is not working'].map((m) => (
            <Button key={m} variant="secondary" block onClick={() => { setMsg(false); toast(`Sent: "${m}"`, 'success') }}>{m}</Button>
          ))}
        </div>
      </Modal>
      <ConfirmDialog open={cancel} onClose={() => setCancel(false)} title="Cancel this session?" confirmLabel="Yes, cancel" danger
        body="It's free to cancel now. If you still need help later, you can book again in a few taps."
        onConfirm={async () => { await bookingService.update(id, { status: 'cancelled', amount: 0 }); toast('Session cancelled. No charge.', 'success'); navigate('/home') }} />
    </MobileShell>
  )
}

export function BookingDetail({ id }: { id: string }) {
  const { navigate } = useRouter()
  const b = bookingService.get(id)
  if (!b) return <MobileShell><TopBar /><Screen><EmptyState title="We couldn't find that booking" action={<Button onClick={() => navigate('/bookings')}>All bookings</Button>} /></Screen></MobileShell>
  const t = technicianService.get(b.technicianId)!
  const steps = b.service === 'visit'
    ? ['Booking confirmed', 'Technician assigned', 'Technician on the way', 'Arrived', 'Service in progress', 'Completed']
    : ['Booking confirmed', 'Technician ready', 'Session in progress', 'Completed']
  const current = b.status === 'completed' ? steps.length : b.status === 'active' ? steps.length - 2 : 1
  return (
    <MobileShell>
      <TopBar title="Booking details" sub={b.id} right={<span className="mr-2"><BookingBadge status={b.status} /></span>} />
      <Screen className="gap-6">
        <div><p className="text-xl font-bold leading-snug">{b.problem}</p><p className="mt-1 text-sm text-text-muted">{b.device} · {b.date}, {b.time}</p></div>
        <TechSummary t={t} trailing={<VerificationBadge status={t.verification} compact />} />
        <section><SectionLabel>Progress</SectionLabel><Timeline steps={steps} current={current} /></section>
        <dl className="divide-y divide-border rounded-lg border border-border bg-surface text-sm">
          <div className="flex justify-between px-4 py-3"><dt className="text-text-muted">Service</dt><dd>{b.service === 'remote' ? 'Remote support' : 'In-person visit'}</dd></div>
          <div className="flex justify-between px-4 py-3"><dt className="text-text-muted">Amount</dt><dd className="font-mono font-semibold">{b.amount ? rupee(b.amount) : '—'}</dd></div>
        </dl>
      </Screen>
      {['accepted', 'waiting'].includes(b.status) && <StickyAction><Button size="lg" block icon="video" onClick={() => navigate(`/waiting/${b.id}`)}>Join Session</Button></StickyAction>}
      {b.status === 'completed' && <StickyAction><Button variant="secondary" size="lg" block onClick={() => navigate('/help')}>Get help again</Button></StickyAction>}
    </MobileShell>
  )
}
