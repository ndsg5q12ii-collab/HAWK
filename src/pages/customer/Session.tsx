import { useEffect, useState } from 'react'
import { TechSummary } from '../../components/domain'
import { Icon } from '../../components/icons'
import { Button, ConfirmDialog, Field, Input, Modal, Notice, PaymentSummary, SectionLabel, Timeline, cx, useToast } from '../../components/ui'
import { VideoStage, useTimer } from '../../components/VideoStage'
import { MobileShell, Screen, StickyAction, TopBar } from '../../layouts/MobileLayout'
import { useRouter } from '../../lib/router'
import { bookingService, paymentService, rupee, technicianService } from '../../services'
import { useApp } from '../../state/AppState'

export function VideoSession({ id }: { id: string }) {
  const { navigate } = useRouter()
  const toast = useToast()
  const b = bookingService.get(id)
  const t = technicianService.get(b?.technicianId ?? 't-rahul')!
  const [dropped, setDropped] = useState(false)
  const time = useTimer(!dropped)
  const [chat, setChat] = useState(false)
  const [end, setEnd] = useState(false)
  const [report, setReport] = useState(false)
  useEffect(() => { bookingService.update(id, { status: 'active' }) }, [id])
  return (
    <MobileShell dark>
      <VideoStage
        remote={{ name: t.name, initials: t.initials, caption: "You're connected." }}
        selfInitials="NS"
        disconnected={dropped}
        onReconnect={() => { setDropped(false); toast("You're back. Session resumed.", 'success') }}
        onChat={() => setChat(true)}
        onEnd={() => setEnd(true)}
        header={<>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-semibold">{t.name}<Icon name="shield" size={14} className="text-[#9fa6f0]" /><span className="sr-only">Verified</span></p>
            <p className="flex items-center gap-2 font-mono text-xs text-white/60"><span className="size-1.5 rounded-full bg-[#ff6b5f]" />{time} · Remote support</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setDropped(true)} className="rounded-sm px-2 py-1 font-mono text-[10px] text-white/40 hover:text-white/70">Demo: drop</button>
            <button onClick={() => setReport(true)} className="rounded-sm px-2.5 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white"><Icon name="flag" size={13} className="mr-1 inline" />Report issue</button>
          </div>
        </>}
      />
      <Modal open={chat} onClose={() => setChat(false)} title="Chat">
        <div className="space-y-2 text-sm">
          <p className="max-w-[80%] rounded-md bg-sunken px-3 py-2">Please open Settings → Network & Internet and tell me what you see.</p>
          <p className="ml-auto max-w-[80%] rounded-md bg-primary px-3 py-2 text-white">It says "No internet, secured"</p>
          <p className="max-w-[80%] rounded-md bg-sunken px-3 py-2">Got it. Let's reset the adapter together.</p>
        </div>
      </Modal>
      <Modal open={report} onClose={() => setReport(false)} title="Report an issue">
        <div className="flex flex-col gap-2">
          {['Technician was rude or unprofessional', 'Asked me to pay outside Setu', 'Audio or video problems', 'Something else'].map((r) => (
            <Button key={r} variant="secondary" block className="justify-start" onClick={() => { setReport(false); toast('Thanks. Our safety team will look into it within 24 hours.', 'success') }}>{r}</Button>
          ))}
        </div>
      </Modal>
      <ConfirmDialog open={end} onClose={() => setEnd(false)} title="End this session?" confirmLabel="End session" danger
        body={`You'll be asked whether the problem is fixed. You only pay ${rupee(t.remotePrice)} + fees if it is.`}
        onConfirm={() => navigate(`/resolution/${id}`)} />
    </MobileShell>
  )
}

export function Resolution({ id }: { id: string }) {
  const { navigate } = useRouter()
  const { setCheckout } = useApp()
  const b = bookingService.get(id)
  const t = technicianService.get(b?.technicianId ?? 't-rahul')!
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null)
  const fixed = () => { setCheckout({ service: 'remote', base: t.remotePrice }); bookingService.update(id, { status: 'completed' }); navigate('/payment') }
  return (
    <MobileShell>
      <Screen className="gap-6 pt-12">
        <div className="text-center">
          <p className="font-mono text-xs text-text-muted">Session with {t.name} ended</p>
          <h1 className="mt-3 text-[28px] font-extrabold tracking-tight">Did we fix the problem?</h1>
        </div>
        <div className="grid gap-3">
          <button onClick={() => setAnswer('yes')} aria-pressed={answer === 'yes'} className={cx('flex h-20 items-center gap-4 rounded-lg border-2 px-5 text-left text-[17px] font-bold transition-colors', answer === 'yes' ? 'border-success bg-success-soft text-success' : 'border-border bg-surface hover:border-border-strong')}>
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-success text-white"><Icon name="check" size={22} strokeWidth={2.4} /></span>Yes, it's fixed
          </button>
          <button onClick={() => setAnswer('no')} aria-pressed={answer === 'no'} className={cx('flex h-20 items-center gap-4 rounded-lg border-2 px-5 text-left text-[17px] font-bold transition-colors', answer === 'no' ? 'border-text-primary bg-sunken' : 'border-border bg-surface hover:border-border-strong')}>
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-text-primary text-white"><Icon name="x" size={20} strokeWidth={2.4} /></span>No, I still need help
          </button>
        </div>
        {answer === 'no' && (
          <div className="animate-fade-up space-y-4 rounded-lg border border-border bg-surface p-5">
            <p className="text-lg font-bold">This may need hands-on assistance.</p>
            <p className="text-sm leading-relaxed text-text-secondary">{t.name.split(' ')[0]} noted it could be a hardware fault. They can visit you, and today's remote session is <span className="font-semibold text-text-primary">not charged</span> if you book the visit.</p>
            <Button size="lg" block icon="mapPin" onClick={() => navigate(`/visit?b=${id}`)}>Request In-Person Visit</Button>
            <Button variant="secondary" block onClick={() => navigate('/technicians')}>Try another technician</Button>
          </div>
        )}
      </Screen>
      {answer === 'yes' && <StickyAction><Button size="lg" block onClick={fixed}>Continue to payment</Button></StickyAction>}
    </MobileShell>
  )
}

const ADDRESSES = ['Home — B-204, Sector 50, Noida', 'Office — Tower C, Sector 62, Noida']
const VISIT_SLOTS = ['10–11 AM', '12–1 PM', '3–4 PM', '6–7 PM']

export function Visit() {
  const { navigate } = useRouter()
  const { technicianId, setCheckout } = useApp()
  const t = technicianService.get(technicianId ?? 't-rahul')!
  const [addr, setAddr] = useState(0)
  const [day, setDay] = useState<'Today' | 'Tomorrow'>('Tomorrow')
  const [slot, setSlot] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const q = paymentService.quote(t.visitFee)
  const request = async () => {
    setBusy(true)
    const b = await bookingService.create({ customer: 'Niladri Sen', technicianId: t.id, technicianName: t.name, category: 'laptop', device: 'Dell Inspiron 15', problem: 'Laptop not connecting to Wi-Fi — visit', service: 'visit', date: day, time: slot!, status: 'accepted', amount: t.visitFee, area: 'Noida' })
    setCheckout({ service: 'visit', base: t.visitFee })
    navigate(`/arrival/${b.id}`)
  }
  return (
    <MobileShell>
      <TopBar title="In-person visit" />
      <Screen className="gap-6">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">Let's get this fixed in person</h1>
        <div className="rounded-lg border border-border bg-surface p-4"><TechSummary t={t} /></div>
        <section><SectionLabel>Address</SectionLabel>
          <div className="space-y-2">{ADDRESSES.map((a, i) => (
            <button key={a} onClick={() => setAddr(i)} aria-pressed={addr === i} className={cx('flex w-full items-center gap-3 rounded-md border px-4 py-3.5 text-left text-sm transition-colors', addr === i ? 'border-primary bg-primary-soft/60' : 'border-border bg-surface')}>
              <span className={cx('inline-flex size-5 items-center justify-center rounded-full border-2', addr === i ? 'border-primary' : 'border-border-strong')}>{addr === i && <span className="size-2.5 rounded-full bg-primary" />}</span>{a}
            </button>))}
          </div></section>
        <section><SectionLabel>Date & time</SectionLabel>
          <div className="mb-3 grid grid-cols-2 gap-2">{(['Today', 'Tomorrow'] as const).map((d) => (
            <button key={d} onClick={() => setDay(d)} className={cx('h-11 rounded-sm border text-sm font-semibold', day === d ? 'border-primary bg-primary text-white' : 'border-border bg-surface')}>{d}</button>))}</div>
          <div className="grid grid-cols-2 gap-2">{VISIT_SLOTS.map((s) => {
            const off = day === 'Today' && s.startsWith('10')
            return <button key={s} disabled={off} onClick={() => setSlot(s)} className={cx('h-11 rounded-sm border font-mono text-[13px]', off ? 'bg-sunken text-disabled line-through' : slot === s ? 'border-primary bg-primary-soft text-primary ring-2 ring-primary/20' : 'border-border bg-surface')}>{s}</button>
          })}</div></section>
        <section><SectionLabel>What you'll pay</SectionLabel>
          <PaymentSummary rows={[['Visit fee', rupee(q.base), 'Includes diagnosis and up to 1 hour of work'], ['Remote session today', rupee(0), 'Waived because it needed a visit'], ['Platform fee', rupee(q.fee)], ['GST (18%)', rupee(q.gst)]]} total={rupee(q.total)} />
          <p className="mt-2 text-[13px] text-text-muted">If parts are needed, {t.name.split(' ')[0]} will share a quote in the app first. Nothing extra is charged without your approval.</p></section>
      </Screen>
      <StickyAction><Button size="lg" block disabled={!slot} loading={busy} onClick={request}>Request Visit · {rupee(q.total)}</Button></StickyAction>
    </MobileShell>
  )
}

const ARRIVAL = ['Booking confirmed', 'Technician assigned', 'Technician on the way', 'Arrived', 'Service in progress', 'Completed']

export function Arrival({ id }: { id: string }) {
  const { navigate } = useRouter()
  const toast = useToast()
  const b = bookingService.get(id)
  const t = technicianService.get(b?.technicianId ?? 't-rahul')!
  const [step, setStep] = useState(2)
  const [otp] = useState('4826')
  return (
    <MobileShell>
      <TopBar title="Your visit" sub={`Booking ${id}`} onBack={() => navigate('/home')} />
      <Screen className="gap-6">
        <div>
          <p className="text-[26px] font-extrabold leading-tight tracking-tight">{step < 3 ? 'Your technician is on the way.' : step < 5 ? `${t.name.split(' ')[0]} is with you.` : 'All done.'}</p>
          {step < 3 && <p className="mt-1 font-mono text-sm text-text-secondary">Arriving in ~18 min · {b?.time ?? ''}</p>}
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <TechSummary t={t} trailing={<Button variant="secondary" size="sm" icon="phone" onClick={() => toast('Calling through a masked Setu number…')}>Call</Button>} />
        </div>
        <section><SectionLabel>Status</SectionLabel><Timeline steps={ARRIVAL} current={step} /></section>
        <Notice tone="primary" icon="shield">Your technician's identity is verified. Share code <span className="font-mono font-bold tracking-widest">{otp}</span> only when they arrive.</Notice>
      </Screen>
      <StickyAction>
        {step < 5 ? <Button size="lg" block variant="secondary" onClick={() => setStep(step + 1)}>Demo: advance status</Button>
          : <Button size="lg" block onClick={() => { bookingService.update(id, { status: 'completed' }); navigate('/payment') }}>Continue to payment</Button>}
      </StickyAction>
    </MobileShell>
  )
}

export function Payment() {
  const { navigate } = useRouter()
  const { checkout, technicianId } = useApp()
  const t = technicianService.get(technicianId ?? 't-rahul')!
  const c = checkout ?? { service: 'remote' as const, base: t.remotePrice }
  const q = paymentService.quote(c.base)
  const [method, setMethod] = useState('UPI')
  const [upi, setUpi] = useState('niladri@okhdfc')
  const [busy, setBusy] = useState(false)
  const [state, setState] = useState<'idle' | 'failed' | 'done'>('idle')
  const [error, setError] = useState('')
  const [fail, setFail] = useState(false)
  const pay = async () => {
    setBusy(true)
    try { await paymentService.pay(q.total, method, fail); setState('done'); setTimeout(() => navigate('/review'), 1100) } catch (e) { setError((e as Error).message); setState('failed') }
    setBusy(false)
  }
  return (
    <MobileShell>
      <TopBar title="Payment" />
      <Screen className="gap-6">
        <PaymentSummary
          rows={[[c.service === 'remote' ? 'Remote support' : 'In-person visit', rupee(q.base), `with ${t.name}`], ['Platform fee', rupee(q.fee)], ['GST (18%)', rupee(q.gst)]]}
          total={rupee(q.total)} />
        <section><SectionLabel>Pay with</SectionLabel>
          <div className="space-y-2">
            {[['UPI', 'Google Pay, PhonePe, Paytm, BHIM'], ['Card', 'Debit or credit card'], ['Net banking', 'All major Indian banks']].map(([m, d]) => (
              <button key={m} onClick={() => setMethod(m)} aria-pressed={method === m} className={cx('flex w-full items-center gap-3 rounded-md border px-4 py-3.5 text-left transition-colors', method === m ? 'border-primary bg-primary-soft/60' : 'border-border bg-surface')}>
                <span className={cx('inline-flex size-5 items-center justify-center rounded-full border-2', method === m ? 'border-primary' : 'border-border-strong')}>{method === m && <span className="size-2.5 rounded-full bg-primary" />}</span>
                <span><span className="block text-sm font-semibold">{m}</span><span className="text-xs text-text-muted">{d}</span></span>
              </button>
            ))}
          </div>
          {method === 'UPI' && <div className="mt-3"><Field label="UPI ID"><Input value={upi} onChange={(e) => setUpi(e.target.value)} className="font-mono" /></Field></div>}
        </section>
        {state === 'failed' && <Notice tone="error" icon="alert"><span className="font-semibold">Payment failed.</span> {error} Try again or choose another method.</Notice>}
        <label className="flex items-center gap-2 font-mono text-[11px] text-text-muted"><input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} />Demo: simulate payment failure</label>
      </Screen>
      <StickyAction>
        <Button size="lg" block icon="lock" loading={busy} success={state === 'done'} onClick={pay}>{state === 'done' ? 'Paid' : `Pay ${rupee(q.total)} securely`}</Button>
      </StickyAction>
    </MobileShell>
  )
}
