import { useEffect, useMemo, useState } from 'react'
import { ReviewCard, TechnicianCard } from '../../components/domain'
import { Icon } from '../../components/icons'
import { Avatar, Badge, Button, Chip, EmptyState, Notice, Rating, SectionLabel, Skeleton, VerificationBadge, cx, useAsync } from '../../components/ui'
import { MobileShell, Screen, StickyAction, TopBar } from '../../layouts/MobileLayout'
import { useRouter } from '../../lib/router'
import { catalogService, rupee, technicianService } from '../../services'
import { useApp } from '../../state/AppState'

const CHECKS = ['Checking device expertise', 'Checking availability', 'Checking location', 'Finding nearby support']

export function Matching() {
  const { navigate } = useRouter()
  const { draft } = useApp()
  const [done, setDone] = useState(0)
  useEffect(() => {
    if (done >= CHECKS.length) { const t = setTimeout(() => navigate('/technicians'), 450); return () => clearTimeout(t) }
    const t = setTimeout(() => setDone(done + 1), 520 + done * 90)
    return () => clearTimeout(t)
  }, [done, navigate])
  const cat = catalogService.category(draft.category)
  return (
    <MobileShell>
      <Screen className="justify-center">
        <div className="relative mx-auto mb-10 flex size-28 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-primary/15" />
          <span className="absolute inset-3 rounded-full border border-primary/25" />
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 112 112" aria-hidden>
            <circle cx="56" cy="56" r="54" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"
              strokeDasharray={339} strokeDashoffset={339 - (339 * done) / CHECKS.length} className="transition-[stroke-dashoffset] duration-500 ease-out" />
          </svg>
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-primary text-white"><Icon name={cat.icon} size={28} strokeWidth={1.5} /></span>
        </div>
        <h1 className="text-center text-2xl font-extrabold tracking-tight">Finding the right technician…</h1>
        <p className="mt-2 text-center text-[15px] text-text-secondary">For your {cat.label.toLowerCase()} in Noida</p>
        <ul className="mx-auto mt-8 w-full max-w-[280px] space-y-3.5">
          {CHECKS.map((c, i) => (
            <li key={c} className={cx('flex items-center gap-3 text-[15px] transition-opacity duration-300', i <= done ? 'opacity-100' : 'opacity-35')}>
              <span className={cx('inline-flex size-6 items-center justify-center rounded-full transition-colors', i < done ? 'bg-success text-white' : 'border-2 border-border-strong')}>
                {i < done && <Icon name="check" size={14} strokeWidth={2.6} className="animate-pop" />}
              </span>
              <span className={i < done ? 'font-medium' : ''}>{c}</span>
            </li>
          ))}
        </ul>
      </Screen>
    </MobileShell>
  )
}

type Filter = 'now' | 'rating' | 'price' | 'expertise'

export function Results() {
  const { navigate } = useRouter()
  const { draft, setTechnicianId } = useApp()
  const [filters, setFilters] = useState<Filter[]>([])
  const [simulateNone, setSimulateNone] = useState(false)
  const { data, loading } = useAsync(() => technicianService.match(draft.category), [draft.category])
  const toggle = (f: Filter) => setFilters((x) => (x.includes(f) ? x.filter((y) => y !== f) : [...x, f]))

  const list = useMemo(() => {
    let l = simulateNone ? [] : [...(data ?? [])]
    if (filters.includes('now')) l = l.filter((t) => t.availability === 'available')
    if (filters.includes('expertise')) l = l.filter((t) => t.experienceYears >= 6)
    if (filters.includes('rating')) l.sort((a, b) => b.rating - a.rating)
    if (filters.includes('price')) l.sort((a, b) => a.remotePrice - b.remotePrice)
    return l
  }, [data, filters, simulateNone])

  const book = (id: string) => { setTechnicianId(id); navigate('/booking') }

  return (
    <MobileShell>
      <TopBar onBack={() => navigate('/problem')} title="Technicians available" sub={`${catalogService.category(draft.category).label} · Noida`} />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-4">
        {([['now', 'Available now'], ['rating', 'Top rated'], ['price', 'Lowest price'], ['expertise', '6+ yrs experience']] as const).map(([k, l]) => (
          <Chip key={k} active={filters.includes(k)} onClick={() => toggle(k)}>{l}</Chip>
        ))}
      </div>
      <Screen className="gap-3">
        {loading ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-48" />) : list.length === 0 ? (
          <EmptyState icon="users" title="No technicians are available right now."
            body="Everyone who fixes this kind of problem is busy. You can try again shortly or book a time that suits you."
            action={<><Button variant="secondary" size="sm" onClick={() => { setSimulateNone(false); setFilters([]) }}>Try another time</Button><Button size="sm" onClick={() => list.length || data?.[0] ? book(data![0].id) : null}>Schedule support</Button></>} />
        ) : list.map((t) => <TechnicianCard key={t.id} t={t} onView={() => navigate(`/technician/${t.id}`)} onBook={() => book(t.id)} />)}
        <p className="pt-2 text-center text-[13px] text-text-muted">Prices are for a remote session. You only pay once the session ends.</p>
        <button className="mx-auto font-mono text-[11px] text-text-muted underline" onClick={() => setSimulateNone(!simulateNone)}>Demo: {simulateNone ? 'show technicians' : 'simulate none available'}</button>
      </Screen>
    </MobileShell>
  )
}

export function TechnicianProfile({ id }: { id: string }) {
  const { navigate } = useRouter()
  const { setTechnicianId } = useApp()
  const t = technicianService.get(id)
  if (!t) return <MobileShell><TopBar /><Screen><EmptyState title="We couldn't find this technician" action={<Button onClick={() => navigate('/technicians')}>Back to results</Button>} /></Screen></MobileShell>
  const go = () => { setTechnicianId(t.id); navigate('/booking') }
  return (
    <MobileShell>
      <TopBar title={t.name} />
      <Screen className="gap-7">
        <div className="flex flex-col items-center text-center">
          <Avatar initials={t.initials} size={88} online={t.availability === 'available'} />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">{t.name}</h1>
          <div className="mt-2"><VerificationBadge status={t.verification} /></div>
          <div className="mt-5 grid w-full grid-cols-3 divide-x divide-border rounded-lg border border-border bg-surface py-3">
            <div><Rating value={t.rating} size="md" /><p className="mt-0.5 text-[11px] text-text-muted">{t.reviews.length * 47} reviews</p></div>
            <div><p className="font-mono text-[15px] font-semibold">{t.sessions}</p><p className="mt-0.5 text-[11px] text-text-muted">Sessions</p></div>
            <div><p className="font-mono text-[15px] font-semibold">{t.experienceYears} yrs</p><p className="mt-0.5 text-[11px] text-text-muted">Experience</p></div>
          </div>
        </div>

        <Notice tone="primary" icon="shield">
          <span className="font-semibold">Verified by Setu.</span> Government ID and address checked, and a skills assessment passed. Since {t.joined}.
        </Notice>

        <section><SectionLabel>About</SectionLabel><p className="text-[15px] leading-relaxed text-text-secondary">{t.about}</p>
          <p className="mt-2 text-[13px] text-text-muted">Speaks {t.languages.join(', ')} · Based in {t.area}</p></section>

        <section><SectionLabel>Expertise & devices</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {t.skills.map((s) => <Badge key={s}>{s}</Badge>)}
            {t.categories.map((c) => <Badge key={c} tone="primary">{catalogService.category(c).label}</Badge>)}
          </div></section>

        <section><SectionLabel>Pricing</SectionLabel>
          <div className="divide-y divide-border rounded-lg border border-border bg-surface text-sm">
            <div className="flex justify-between px-4 py-3"><span className="text-text-secondary">Remote video session</span><span className="font-mono font-semibold">{rupee(t.remotePrice)}</span></div>
            <div className="flex justify-between px-4 py-3"><span className="text-text-secondary">In-person visit (if needed)</span><span className="font-mono font-semibold">{rupee(t.visitFee)}</span></div>
          </div>
          <p className="mt-2 text-[13px] text-text-muted">Parts, if any, are quoted before work starts.</p></section>

        <section><SectionLabel>Recent work</SectionLabel>
          <ul className="space-y-2">{t.recentWork.map((w) => <li key={w} className="flex gap-2.5 text-sm text-text-secondary"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />{w}</li>)}</ul></section>

        <section><SectionLabel>Reviews</SectionLabel>{t.reviews.map((r) => <ReviewCard key={r.id} r={r} />)}</section>
      </Screen>
      <StickyAction>
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" className="flex-1" onClick={go}>Schedule for Later</Button>
          <Button size="lg" className="flex-[1.4]" onClick={go} disabled={t.availability !== 'available'}>Book Remote Session</Button>
        </div>
      </StickyAction>
    </MobileShell>
  )
}
