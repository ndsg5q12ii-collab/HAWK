import { useState } from 'react'
import { BookingCard, CategoryTile } from '../../components/domain'
import { Icon } from '../../components/icons'
import { Avatar, Button, EmptyState, Field, Input, Notice, SectionLabel, Select, Skeleton, cx, useAsync } from '../../components/ui'
import { MobileShell, Screen, StickyAction, TopBar } from '../../layouts/MobileLayout'
import { useRouter } from '../../lib/router'
import { bookingService, catalogService } from '../../services'
import { useApp } from '../../state/AppState'
import type { DeviceCategory } from '../../types'
import { CUSTOMER_NAV } from './nav'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function Home() {
  const { navigate } = useRouter()
  const { userName, setDraft, booking } = useApp()
  const [showActive, setShowActive] = useState(true)
  const { data, loading } = useAsync(() => bookingService.forCustomer('Niladri Sen'))
  const active = booking ?? data?.find((b) => ['accepted', 'waiting', 'active'].includes(b.status))
  const recent = data?.filter((b) => b.status === 'completed').slice(0, 2) ?? []
  const quick = catalogService.categories().filter((c) => ['laptop', 'pc', 'phone', 'wifi', 'tv', 'other'].includes(c.id))
  const pick = (id: DeviceCategory) => { setDraft({ category: id }); navigate('/problem') }

  return (
    <MobileShell nav={CUSTOMER_NAV}>
      <Screen className="gap-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[15px] text-text-secondary">{greeting()}, {userName ?? 'Niladri'}</p>
            <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight">What can we<br />help you with?</h1>
          </div>
          <button onClick={() => navigate('/profile')} aria-label="Profile"><Avatar initials="NS" size={44} /></button>
        </header>

        <Button size="lg" block icon="plus" onClick={() => navigate('/help')} className="h-[60px] text-base">Get Technical Help</Button>

        <section>
          <SectionLabel>What's wrong?</SectionLabel>
          <div className="grid grid-cols-3 gap-2.5">
            {quick.map((c) => <CategoryTile key={c.id} {...c} compact label={c.id === 'pc' ? 'PC' : c.label} onClick={() => pick(c.id)} />)}
          </div>
        </section>

        <section>
          <SectionLabel action={<button className="text-xs font-semibold text-primary" onClick={() => setShowActive(!showActive)}>{showActive ? 'Preview empty' : 'Show active'}</button>}>Active support</SectionLabel>
          {loading ? <Skeleton className="h-28" /> : active && showActive ? (
            <button onClick={() => navigate(`/booking/${active.id}`)} className="block w-full rounded-lg bg-ink p-4 text-left text-white transition-transform active:scale-[0.99]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#5fd39b]"><span className="size-2 rounded-full bg-[#5fd39b] animate-pulse-ring" />Confirmed · {active.date}, {active.time}</span>
                <span className="font-mono text-[11px] text-white/50">{active.id}</span>
              </div>
              <p className="mt-3 font-semibold">{active.problem}</p>
              <div className="mt-4 flex items-center gap-3">
                <Avatar initials="RK" size={36} />
                <div className="flex-1 text-[13px]"><p className="font-semibold">{active.technicianName}</p><p className="text-white/60">Remote session · ₹{active.amount}</p></div>
                <span className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-white px-3 text-[13px] font-semibold text-ink">Join<Icon name="chevronRight" size={15} /></span>
              </div>
            </button>
          ) : <EmptyState icon="calendar" title="No active support requests" body="When you book a technician, your session will show up here." />}
        </section>

        <section>
          <SectionLabel action={<button onClick={() => navigate('/bookings')} className="text-xs font-semibold text-primary">See all</button>}>Recent support</SectionLabel>
          <div className="space-y-2.5">
            {loading ? <><Skeleton className="h-24" /><Skeleton className="h-24" /></> : recent.map((b) => <BookingCard key={b.id} b={b} onClick={() => navigate(`/booking/${b.id}`)} />)}
          </div>
        </section>

        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-border pt-6 text-center text-[12px] font-medium text-text-muted">
          <Icon name="shield" size={14} />Verified technicians <span>•</span> Secure payments <span>•</span> Support when you need it
        </p>
      </Screen>
    </MobileShell>
  )
}

export function DeviceSelect() {
  const { navigate } = useRouter()
  const { setDraft } = useApp()
  return (
    <MobileShell>
      <TopBar onBack={() => navigate('/home')} />
      <Screen>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Step 1 of 2</p>
        <h1 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight">What do you need help with?</h1>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {catalogService.categories().map((c) => (
            <CategoryTile key={c.id} {...c} onClick={() => { setDraft({ category: c.id }); navigate('/problem') }} />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-text-muted">Not sure? Pick <span className="font-semibold text-text-secondary">Other</span> — we'll figure it out together.</p>
      </Screen>
    </MobileShell>
  )
}

const BRANDS: Record<string, string[]> = {
  laptop: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Other'],
  pc: ['Custom build', 'Dell', 'HP', 'Lenovo', 'Other'],
  phone: ['Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Vivo', 'Other'],
  tablet: ['Apple', 'Samsung', 'Lenovo', 'Other'],
  wifi: ['Jio Fiber', 'Airtel Xstream', 'TP-Link', 'D-Link', 'Other'],
  tv: ['Samsung', 'LG', 'Sony', 'Mi', 'Other'],
  printer: ['HP', 'Canon', 'Epson', 'Brother', 'Other'],
  other: ['Not sure'],
}

export function Problem() {
  const { navigate } = useRouter()
  const { draft, setDraft } = useApp()
  const cat = catalogService.category(draft.category)
  const brands = BRANDS[draft.category]
  const brand = brands.includes(draft.brand) ? draft.brand : brands[0]
  const [touched, setTouched] = useState(false)
  const tooShort = draft.description.trim().length < 10
  const attach = (kind: string) => setDraft({ attachments: draft.attachments.includes(kind) ? draft.attachments.filter((a) => a !== kind) : [...draft.attachments, kind] })

  return (
    <MobileShell>
      <TopBar onBack={() => navigate('/help')} sub="Step 2 of 2" title={cat.label} right={<span className="mr-3 text-primary"><Icon name={cat.icon} /></span>} />
      <Screen className="gap-6">
        <div>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">Tell us what's happening</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">You don't need to know the technical reason. Just describe what you're seeing.</p>
        </div>
        <div>
          <textarea
            value={draft.description} rows={6} onBlur={() => setTouched(true)}
            onChange={(e) => setDraft({ description: e.target.value })}
            placeholder="Example: My laptop turns on, but the screen stays black…"
            aria-label="Describe the problem"
            className={cx('w-full resize-none rounded-lg border bg-surface p-4 text-[15px] leading-relaxed outline-none placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10',
              touched && tooShort ? 'border-error' : 'border-border-strong')}
          />
          <div className="mt-1.5 flex justify-between text-[13px]">
            {touched && tooShort ? <span className="text-error">A few more words will help us find the right person.</span> : <span className="text-text-muted">You can explain the problem in your own words.</span>}
            <span className="font-mono text-text-muted">{draft.description.length}</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-text-secondary">Add a photo or video <span className="font-normal text-text-muted">(optional)</span></p>
          <div className="grid grid-cols-3 gap-2">
            {([['photo', 'Photo', 'camera'], ['screenshot', 'Screenshot', 'image'], ['video', 'Video', 'film']] as const).map(([k, l, i]) => {
              const on = draft.attachments.includes(k)
              return (
                <button key={k} onClick={() => attach(k)} aria-pressed={on}
                  className={cx('flex h-20 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed text-[13px] font-semibold transition-colors',
                    on ? 'border-solid border-success bg-success-soft text-success' : 'border-border-strong text-text-secondary hover:bg-sunken')}>
                  <Icon name={on ? 'check' : i} size={20} />{on ? `${l} added` : l}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Brand"><Select value={brand} onChange={(v) => setDraft({ brand: v })} options={brands} /></Field>
          <Field label="Model" hint="If you know it"><Input value={draft.model} onChange={(e) => setDraft({ model: e.target.value })} placeholder={draft.category === 'laptop' ? 'Inspiron 15' : 'Optional'} /></Field>
        </div>
        <Notice icon="lock">Your photos are only shared with the technician you book.</Notice>
      </Screen>
      <StickyAction>
        <Button size="lg" block disabled={tooShort} onClick={() => { setDraft({ brand }); navigate('/matching') }}>Find a Technician</Button>
      </StickyAction>
    </MobileShell>
  )
}
