import { useState } from 'react'
import { BookingCard, DeviceCard } from '../../components/domain'
import { Icon, type IconName } from '../../components/icons'
import { Avatar, Button, ConfirmDialog, EmptyState, Field, Input, Modal, Select, Skeleton, StarInput, Tabs, cx, useAsync, useToast } from '../../components/ui'
import { MobileShell, Screen, StickyAction } from '../../layouts/MobileLayout'
import { useRouter } from '../../lib/router'
import { bookingService, catalogService, deviceService, reviewService, technicianService } from '../../services'
import { useApp } from '../../state/AppState'
import type { DeviceCategory } from '../../types'
import { CUSTOMER_NAV } from './nav'

const TAGS = ['Helpful', 'Professional', 'Fast', 'Solved my problem', 'Explained clearly']

export function ReviewPage() {
  const { navigate } = useRouter()
  const toast = useToast()
  const { technicianId, setBooking, setCheckout } = useApp()
  const t = technicianService.get(technicianId ?? 't-rahul')!
  const [rating, setRating] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true); await reviewService.submit({ rating, tags, text })
    setBooking(null); setCheckout(null)
    toast('Thanks — your review helps others choose.', 'success'); navigate('/home')
  }
  return (
    <MobileShell>
      <Screen className="gap-7 pt-10">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success animate-pop"><Icon name="check" size={14} strokeWidth={2.4} />Payment successful</span>
          <Avatar initials={t.initials} size={64} />
          <h1 className="mt-4 text-[26px] font-extrabold tracking-tight">How was your experience?</h1>
          <p className="mt-1 text-sm text-text-secondary">with {t.name}</p>
          <div className="mt-5"><StarInput value={rating} onChange={setRating} /></div>
        </div>
        <section>
          <p className="mb-3 text-sm font-semibold">What went well? <span className="font-normal text-text-muted">(optional)</span></p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((g) => {
              const on = tags.includes(g)
              return <button key={g} onClick={() => setTags(on ? tags.filter((x) => x !== g) : [...tags, g])} aria-pressed={on}
                className={cx('h-9 rounded-full border px-3.5 text-[13px] font-semibold transition-colors', on ? 'border-primary bg-primary-soft text-primary' : 'border-border-strong bg-surface text-text-secondary')}>{on && '✓ '}{g}</button>
            })}
          </div>
        </section>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Tell others about your session (optional)" aria-label="Written review"
          className="w-full resize-none rounded-lg border border-border-strong bg-surface p-4 text-[15px] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
      </Screen>
      <StickyAction>
        <Button size="lg" block disabled={!rating} loading={busy} onClick={submit}>Submit Review</Button>
        <Button variant="ghost" block className="mt-1" onClick={() => navigate('/home')}>Skip for now</Button>
      </StickyAction>
    </MobileShell>
  )
}

type BTab = 'upcoming' | 'active' | 'completed'
export function Bookings() {
  const { navigate } = useRouter()
  const [tab, setTab] = useState<BTab>('upcoming')
  const { data, loading, error, reload } = useAsync(() => bookingService.forCustomer('Niladri Sen'))
  const groups: Record<BTab, string[]> = { upcoming: ['requested', 'accepted'], active: ['waiting', 'active'], completed: ['completed', 'cancelled', 'refunded', 'disputed'] }
  const list = data?.filter((b) => groups[tab].includes(b.status)) ?? []
  const count = (t: BTab) => data?.filter((b) => groups[t].includes(b.status)).length
  return (
    <MobileShell nav={CUSTOMER_NAV}>
      <Screen className="gap-5">
        <h1 className="text-[26px] font-extrabold tracking-tight">Bookings</h1>
        <Tabs value={tab} onChange={setTab} tabs={[{ id: 'upcoming', label: 'Upcoming', count: count('upcoming') }, { id: 'active', label: 'Active', count: count('active') }, { id: 'completed', label: 'Completed', count: count('completed') }]} />
        <div className="space-y-2.5">
          {loading ? [0, 1].map((i) => <Skeleton key={i} className="h-28" />)
            : error ? <EmptyState icon="wifiOff" title="We couldn't load your bookings" body="Check your internet connection and try again." action={<Button size="sm" onClick={reload}>Try again</Button>} />
            : list.length === 0 ? <EmptyState icon="calendar" title={tab === 'active' ? 'Nothing in progress right now' : `No ${tab} bookings`} action={<Button size="sm" icon="plus" onClick={() => navigate('/help')}>Get Technical Help</Button>} />
            : list.map((b) => <BookingCard key={b.id} b={b} onClick={() => navigate(`/booking/${b.id}`)} />)}
        </div>
      </Screen>
    </MobileShell>
  )
}

export function Devices() {
  const toast = useToast()
  const { data, loading, reload } = useAsync(() => deviceService.list())
  const [open, setOpen] = useState(false)
  const [cat, setCat] = useState<DeviceCategory>('laptop')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const add = async () => { await deviceService.add({ category: cat, brand, model, lastSession: null }); setOpen(false); setBrand(''); setModel(''); reload(); toast('Device added', 'success') }
  return (
    <MobileShell nav={CUSTOMER_NAV}>
      <Screen className="gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-extrabold tracking-tight">My Devices</h1>
          <Button size="sm" icon="plus" variant="secondary" onClick={() => setOpen(true)}>Add Device</Button>
        </div>
        <p className="-mt-2 text-sm text-text-secondary">Saved devices make booking faster — technicians see the model before the call.</p>
        <div className="space-y-2.5">{loading ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />) : data?.map((d) => <DeviceCard key={d.id} d={d} />)}</div>
      </Screen>
      <Modal open={open} onClose={() => setOpen(false)} title="Add a device" footer={<Button block disabled={!brand || !model} onClick={add}>Save device</Button>}>
        <div className="space-y-4">
          <Field label="Type"><Select value={catalogService.category(cat).label} onChange={(v) => setCat(catalogService.categories().find((c) => c.label === v)!.id)} options={catalogService.categories().map((c) => c.label)} /></Field>
          <Field label="Brand"><Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. HP" /></Field>
          <Field label="Model"><Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Pavilion 14" /></Field>
        </div>
      </Modal>
    </MobileShell>
  )
}

export function Profile() {
  const { navigate } = useRouter()
  const toast = useToast()
  const { setUserName } = useApp()
  const [logout, setLogout] = useState(false)
  const groups: { title: string; items: [IconName, string, string?][] }[] = [
    { title: 'Account', items: [['user', 'Personal information', 'Niladri Sen'], ['mapPin', 'Saved addresses', '2 saved'], ['card', 'Payment methods', 'UPI · niladri@okhdfc'], ['bell', 'Notifications', 'On']] },
    { title: 'Help & legal', items: [['message', 'Support'], ['lock', 'Privacy'], ['doc', 'Terms']] },
  ]
  return (
    <MobileShell nav={CUSTOMER_NAV}>
      <Screen className="gap-6">
        <div className="flex items-center gap-4">
          <Avatar initials="NS" size={64} />
          <div><h1 className="text-xl font-bold">Niladri Sen</h1><p className="font-mono text-sm text-text-muted">+91 98•••• ••210</p></div>
        </div>
        {groups.map((g) => (
          <section key={g.title}>
            <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">{g.title}</p>
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {g.items.map(([icon, label, val]) => (
                <li key={label}><button onClick={() => toast(`${label} opens here — not part of this prototype yet.`)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm hover:bg-sunken/60">
                  <Icon name={icon} size={18} className="text-text-muted" /><span className="flex-1 font-medium">{label}</span>
                  {val && <span className="text-[13px] text-text-muted">{val}</span>}<Icon name="chevronRight" size={16} className="text-text-muted" /></button></li>
              ))}
            </ul>
          </section>
        ))}
        <Button variant="secondary" block icon="logout" className="!text-error" onClick={() => setLogout(true)}>Log out</Button>
        <p className="text-center font-mono text-[11px] text-text-muted">Setu v0.9 · prototype with mock data</p>
      </Screen>
      <ConfirmDialog open={logout} onClose={() => setLogout(false)} title="Log out?" body="You'll need your phone number and a code to sign in again." confirmLabel="Log out" danger
        onConfirm={() => { setUserName(null); navigate('/login') }} />
    </MobileShell>
  )
}
