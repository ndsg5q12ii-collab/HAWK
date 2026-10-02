import { useMemo, useState, type ReactNode } from 'react'
import { BarChart, LineChart, Meter } from '../../components/charts'
import { Icon, type IconName } from '../../components/icons'
import { AvailabilityBadge, Avatar, Badge, BookingBadge, Button, ConfirmDialog, DisputeBadge, EmptyState, Modal, PaymentBadge, Rating, Select, Skeleton, VerificationBadge, cx, useAsync, useToast } from '../../components/ui'
import AdminLayout from '../../layouts/AdminLayout'
import { Link, useRouter } from '../../lib/router'
import { adminService, bookingService, catalogService, paymentService, rupee, technicianService } from '../../services'
import { PRICING, TECHNICIANS } from '../../services/mock/data'
import type { Booking, Dispute, Technician, VerificationStatus } from '../../types'

/* ---------- shared table primitives ---------- */
function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[760px] text-left text-[13px]">
        <thead><tr className="border-b border-border bg-sunken/50">{head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
      {empty && <div className="p-6"><EmptyState icon="search" title="No results match these filters" /></div>}
    </div>
  )
}
const Td = ({ children, className }: { children: ReactNode; className?: string }) => <td className={cx('whitespace-nowrap px-4 py-3', className)}>{children}</td>

function FilterBar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2 [&_select]:h-9 [&_select]:text-[13px]">{children}</div>
}
function F({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return <label className="flex items-center gap-2 text-[12px] text-text-muted"><span className="sr-only sm:not-sr-only">{label}</span><Select className="w-40" value={value} onChange={onChange} options={options} /></label>
}

function Panel({ title, sub, children, action, className }: { title: string; sub?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-lg border border-border bg-surface p-5', className)}>
      <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold">{title}</h2>{sub && <p className="mt-0.5 text-[12px] text-text-muted">{sub}</p>}</div>{action}</div>
      {children}
    </section>
  )
}

/* ---------- Dashboard ---------- */
export function AdminDashboard() {
  const daily = adminService.daily()
  const activity = adminService.activity()
  const today = daily[daily.length - 1], prev = daily[daily.length - 8]
  const totalRemote = daily.reduce((s, d) => s + d.remote, 0), totalVisit = daily.reduce((s, d) => s + d.visit, 0)
  const rev = daily.reduce((s, d) => s + d.revenue, 0)
  const kpis: [string, string, string, IconName, boolean?][] = [
    ['Total customers', '12,486', '+312 this week', 'users'],
    ['Active technicians', '184', '41 online now', 'wrench'],
    ['Sessions today', String(today.remote + today.visit), `vs ${prev.remote + prev.visit} last ${prev.d.split(' ')[0]}th`, 'video'],
    ['Revenue · 14d', rupee(rev), '+18% vs prior 14d', 'rupee'],
    ['Platform commission', rupee(Math.round(rev * PRICING.commissionRate)), `${PRICING.commissionRate * 100}% take rate`, 'percent'],
    ['Open disputes', '2', '1 older than 24h', 'flag', true],
  ]
  const actIcon: Record<string, [IconName, string]> = { approved: ['shield', 'text-primary bg-primary-soft'], booking: ['calendar', 'text-info bg-info-soft'], payment: ['rupee', 'text-success bg-success-soft'], dispute: ['flag', 'text-error bg-error-soft'] }
  return (
    <AdminLayout title="Dashboard" actions={<Badge tone="warning">Prototype · mock data</Badge>}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map(([k, v, s, i, alert]) => (
          <div key={k} className={cx('rounded-lg border bg-surface p-4', alert ? 'border-error/40' : 'border-border')}>
            <div className="flex items-center justify-between text-text-muted"><p className="text-[12px] font-medium">{k}</p><Icon name={i} size={15} /></div>
            <p className="mt-2 font-mono text-[22px] font-semibold tabular-nums tracking-tight">{v}</p>
            <p className={cx('mt-0.5 text-[11.5px]', alert ? 'text-error' : 'text-text-muted')}>{s}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Are bookings growing?" sub="Daily sessions, last 14 days" action={<div className="flex gap-3 text-[11px] text-text-secondary"><span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-primary" />Remote</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#9fa6f0]" />In-person</span></div>}>
          <BarChart data={daily.map((d) => ({ label: d.d, a: d.remote, b: d.visit }))} />
        </Panel>
        <Panel title="How often is remote enough?" sub="Share of sessions solved without a visit">
          <p className="font-mono text-4xl font-semibold tracking-tight">{Math.round((totalRemote / (totalRemote + totalVisit)) * 100)}%</p>
          <p className="mt-1 text-[13px] text-text-muted">{totalRemote} remote · {totalVisit} escalated to visit</p>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full"><div className="bg-primary" style={{ width: `${(totalRemote / (totalRemote + totalVisit)) * 100}%` }} /><div className="flex-1 bg-[#9fa6f0]" /></div>
          <div className="mt-6 space-y-3">
            <Meter label="Laptop & PC" value={0.82} /><Meter label="Phone & tablet" value={0.88} /><Meter label="Wi-Fi & TV" value={0.71} />
          </div>
        </Panel>
        <Panel title="Revenue" sub="Gross booking value per day (₹)">
          <LineChart data={daily.map((d) => ({ label: d.d, value: d.revenue }))} format={rupee} />
        </Panel>
        <Panel title="Are we fixing problems?" sub="Customers answering 'Yes, it's fixed'">
          <LineChart data={daily.map((d) => ({ label: d.d, value: d.resolved * 100 }))} format={(n) => `${n.toFixed(0)}%`} domain={[70, 95]} color="var(--color-success)" height={130} />
        </Panel>
      </div>

      <Panel title="Recent activity" className="mt-4">
        <ul className="divide-y divide-border">
          {activity.map((a, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5 text-[13px]">
              <span className={cx('inline-flex size-8 items-center justify-center rounded-md', actIcon[a.kind][1])}><Icon name={actIcon[a.kind][0]} size={15} /></span>
              <span className="flex-1">{a.text}</span><span className="font-mono text-[11px] text-text-muted">{a.time}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </AdminLayout>
  )
}

/* ---------- Technicians ---------- */
type Act = { t: Technician; action: 'approve' | 'reject' | 'suspend' } | null
const actionCopy = { approve: ['Approve', 'verified'], reject: ['Reject', 'rejected'], suspend: ['Suspend', 'suspended'] } as const

function useTechActions() {
  const toast = useToast()
  const [act, setAct] = useState<Act>(null)
  const [, force] = useState(0)
  const dialog = act && (
    <ConfirmDialog open onClose={() => setAct(null)} danger={act.action !== 'approve'} confirmLabel={actionCopy[act.action][0]}
      title={`${actionCopy[act.action][0]} ${act.t.name}?`}
      body={act.action === 'approve' ? 'They will appear in customer search and can start taking bookings immediately.' : act.action === 'suspend' ? 'They will be taken offline and hidden from customers. Upcoming bookings will be reassigned.' : 'Their application will be closed. They can reapply after 90 days.'}
      onConfirm={async () => { await technicianService.setVerification(act.t.id, actionCopy[act.action][1] as VerificationStatus); force((x) => x + 1); toast(`${act.t.name} ${actionCopy[act.action][1]}`, 'success') }} />
  )
  return { setAct, dialog }
}

export function AdminTechnicians() {
  const { navigate } = useRouter()
  const { data, loading } = useAsync(() => technicianService.list())
  const [status, setStatus] = useState('All statuses')
  const [cat, setCat] = useState('All categories')
  const [rating, setRating] = useState('Any rating')
  const [avail, setAvail] = useState('Any availability')
  const { setAct, dialog } = useTechActions()
  const list = (data ? TECHNICIANS : []).filter((t) =>
    (status === 'All statuses' || t.verification === status.toLowerCase()) &&
    (cat === 'All categories' || t.categories.some((c) => catalogService.category(c).label === cat)) &&
    (rating === 'Any rating' || t.rating >= parseFloat(rating)) &&
    (avail === 'Any availability' || t.availability === avail.toLowerCase()))
  return (
    <AdminLayout title="Technicians" actions={<span className="text-[13px] text-text-muted">{TECHNICIANS.filter((t) => t.verification === 'pending').length} awaiting review</span>}>
      <FilterBar>
        <F label="Status" value={status} onChange={setStatus} options={['All statuses', 'Verified', 'Pending', 'Suspended', 'Rejected']} />
        <F label="Category" value={cat} onChange={setCat} options={['All categories', ...catalogService.categories().map((c) => c.label)]} />
        <F label="Rating" value={rating} onChange={setRating} options={['Any rating', '4.5+', '4.0+']} />
        <F label="Availability" value={avail} onChange={setAvail} options={['Any availability', 'Available', 'Busy', 'Offline']} />
      </FilterBar>
      {loading ? <Skeleton className="h-72" /> : (
        <Table head={['Technician', 'Verification', 'Skills', 'Rating', 'Sessions', 'Availability', 'Actions']} empty={!list.length}>
          {list.map((t) => (
            <tr key={t.id} className="hover:bg-sunken/40">
              <Td><button onClick={() => navigate(`/admin/technicians/${t.id}`)} className="flex items-center gap-2.5 text-left"><Avatar initials={t.initials} size={30} /><span><span className="block font-semibold hover:text-primary">{t.name}</span><span className="text-[11.5px] text-text-muted">{t.area}</span></span></button></Td>
              <Td><VerificationBadge status={t.verification} compact /></Td>
              <Td className="text-text-secondary">{t.skills.join(', ')}</Td>
              <Td><Rating value={t.rating} /></Td>
              <Td className="font-mono">{t.sessions}</Td>
              <Td><AvailabilityBadge status={t.availability} /></Td>
              <Td>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/technicians/${t.id}`)}>View</Button>
                  {t.verification === 'pending' && <><Button size="sm" onClick={() => setAct({ t, action: 'approve' })}>Approve</Button><Button size="sm" variant="secondary" onClick={() => setAct({ t, action: 'reject' })}>Reject</Button></>}
                  {t.verification === 'verified' && <Button size="sm" variant="secondary" className="!text-error" onClick={() => setAct({ t, action: 'suspend' })}>Suspend</Button>}
                  {t.verification === 'suspended' && <Button size="sm" variant="secondary" onClick={() => setAct({ t, action: 'approve' })}>Reinstate</Button>}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}
      {dialog}
    </AdminLayout>
  )
}

export function AdminTechnicianDetail({ id }: { id: string }) {
  const t = technicianService.get(id)
  const { setAct, dialog } = useTechActions()
  const { data: bookings } = useAsync(() => bookingService.forTechnician(id), [id])
  if (!t) return <AdminLayout title="Technician"><EmptyState title="Technician not found" /></AdminLayout>
  const gross = (bookings ?? []).reduce((s, b) => s + b.amount, 0)
  return (
    <AdminLayout title={t.name} actions={
      <div className="flex gap-2">
        {t.verification !== 'verified' && <Button size="sm" onClick={() => setAct({ t, action: 'approve' })}>Approve</Button>}
        {t.verification === 'verified' && <Button size="sm" variant="danger" onClick={() => setAct({ t, action: 'suspend' })}>Suspend</Button>}
        {t.verification === 'pending' && <Button size="sm" variant="secondary" onClick={() => setAct({ t, action: 'reject' })}>Reject</Button>}
      </div>}>
      <Link to="/admin/technicians" className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-text-muted hover:text-text-primary"><Icon name="chevronLeft" size={15} />All technicians</Link>
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <Panel title="Profile">
          <div className="flex items-center gap-3"><Avatar initials={t.initials} size={56} /><div><p className="font-bold">{t.name}</p><p className="text-[12px] text-text-muted">{t.area} · joined {t.joined}</p></div></div>
          <div className="mt-4 flex flex-wrap gap-2"><VerificationBadge status={t.verification} /><AvailabilityBadge status={t.availability} /></div>
          <dl className="mt-5 space-y-2.5 text-[13px]">
            {[['Rating', t.rating ? `${t.rating} ★` : '—'], ['Sessions', t.sessions], ['Experience', `${t.experienceYears} yrs`], ['Remote price', rupee(t.remotePrice)], ['Visit fee', rupee(t.visitFee)], ['Languages', t.languages.join(', ')]].map(([k, v]) => (
              <div key={k as string} className="flex justify-between"><dt className="text-text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-1.5">{t.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>
        </Panel>
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Verification documents" sub="Access is logged">
            <ul className="space-y-2 text-[13px]">
              {['Aadhaar (masked)', 'Selfie face match', 'Address proof', 'Skills assessment'].map((d, i) => (
                <li key={d} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5"><span className="flex items-center gap-2"><Icon name="doc" size={15} className="text-text-muted" />{d}</span>
                  {t.verification === 'pending' && i > 1 ? <Badge tone="warning">To review</Badge> : <Badge tone="success">Checked</Badge>}</li>))}
            </ul>
          </Panel>
          <Panel title="Earnings · mock" sub="Lifetime on platform">
            <p className="font-mono text-3xl font-semibold">{rupee(Math.round(gross * 0.8))}</p>
            <p className="mt-1 text-[12px] text-text-muted">from {rupee(gross)} gross · {rupee(Math.round(gross * 0.2))} commission</p>
          </Panel>
          <Panel title="Recent sessions" className="md:col-span-2">
            {bookings?.length ? <ul className="divide-y divide-border text-[13px]">{bookings.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-2.5"><span className="w-24 font-mono text-text-muted">{b.id}</span><span className="flex-1">{b.problem}</span><BookingBadge status={b.status} /><span className="w-16 text-right font-mono">{rupee(b.amount)}</span></li>))}</ul>
              : <p className="text-[13px] text-text-muted">No sessions yet.</p>}
          </Panel>
          <Panel title="Status history" className="md:col-span-2">
            <ul className="space-y-2 text-[13px]">
              <li className="flex gap-3"><span className="w-24 font-mono text-text-muted">{t.joined}</span>Application submitted</li>
              {t.verification !== 'pending' && <li className="flex gap-3"><span className="w-24 font-mono text-text-muted">{t.joined}</span>Documents verified by Aditi Desai</li>}
              {t.verification === 'suspended' && <li className="flex gap-3 text-error"><span className="w-24 font-mono">Sep 2026</span>Suspended — 3 late arrivals in 30 days</li>}
            </ul>
          </Panel>
        </div>
      </div>
      {dialog}
    </AdminLayout>
  )
}

/* ---------- Bookings ---------- */
export function AdminBookings({ sessionsOnly }: { sessionsOnly?: boolean }) {
  const { data, loading } = useAsync(() => bookingService.list())
  const [status, setStatus] = useState('All statuses')
  const [svc, setSvc] = useState(sessionsOnly ? 'Remote' : 'All services')
  const [date, setDate] = useState('Any date')
  const [tech, setTech] = useState('All technicians')
  const [open, setOpen] = useState<Booking | null>(null)
  const list = useMemo(() => (data ?? []).filter((b) =>
    (status === 'All statuses' || b.status === status.toLowerCase()) &&
    (svc === 'All services' || (svc === 'Remote' ? b.service === 'remote' : b.service === 'visit')) &&
    (date === 'Any date' || b.date === date) && (tech === 'All technicians' || b.technicianName === tech)), [data, status, svc, date, tech])
  return (
    <AdminLayout title={sessionsOnly ? 'Sessions' : 'Bookings'} actions={<span className="font-mono text-[13px] text-text-muted">{list.length} shown</span>}>
      <FilterBar>
        <F label="Date" value={date} onChange={setDate} options={['Any date', 'Today', 'Yesterday', 'Tomorrow']} />
        <F label="Status" value={status} onChange={setStatus} options={['All statuses', 'Requested', 'Accepted', 'Waiting', 'Active', 'Completed', 'Cancelled', 'Disputed', 'Refunded']} />
        <F label="Service" value={svc} onChange={setSvc} options={['All services', 'Remote', 'Visit']} />
        <F label="Technician" value={tech} onChange={setTech} options={['All technicians', ...TECHNICIANS.map((t) => t.name)]} />
      </FilterBar>
      {loading ? <Skeleton className="h-80" /> : (
        <Table head={['Booking ID', 'Customer', 'Technician', 'Device', 'Service', 'Date', 'Status', 'Amount']} empty={!list.length}>
          {list.map((b) => (
            <tr key={b.id} onClick={() => setOpen(b)} className="cursor-pointer hover:bg-sunken/40">
              <Td className="font-mono font-medium text-primary">{b.id}</Td><Td>{b.customer}</Td><Td>{b.technicianName}</Td><Td className="text-text-secondary">{b.device}</Td>
              <Td>{b.service === 'remote' ? 'Remote' : 'Visit'}</Td><Td className="text-text-secondary">{b.date}, {b.time}</Td><Td><BookingBadge status={b.status} /></Td><Td className="text-right font-mono">{b.amount ? rupee(b.amount) : '—'}</Td>
            </tr>
          ))}
        </Table>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.id ?? ''} side="right">
        {open && (
          <div className="space-y-5 text-[13px]">
            <div><BookingBadge status={open.status} /><p className="mt-3 text-lg font-bold">{open.problem}</p><p className="text-text-muted">{open.device} · {catalogService.category(open.category).label}</p></div>
            <dl className="divide-y divide-border rounded-lg border border-border">
              {[['Customer', open.customer], ['Technician', open.technicianName], ['Service', open.service === 'remote' ? 'Remote support' : 'In-person visit'], ['When', `${open.date}, ${open.time}`], ['Area', open.area], ['Amount', open.amount ? rupee(open.amount) : '—'], ['Commission', rupee(Math.round(open.amount * PRICING.commissionRate))]].map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2.5"><dt className="text-text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>))}
            </dl>
            <p className="text-[12px] text-text-muted">Customer and technician phone numbers are masked. Use in-app calling for support follow-ups.</p>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}

/* ---------- Payments ---------- */
export function AdminPayments() {
  const { data, loading } = useAsync(() => paymentService.transactions())
  const [s, setS] = useState<'all' | 'successful' | 'pending' | 'refunded' | 'failed'>('all')
  const list = (data ?? []).filter((t) => s === 'all' || t.status === s)
  const sum = (k: 'gross' | 'commission' | 'payout') => list.reduce((a, t) => a + (t.status === 'successful' ? t[k] : 0), 0)
  return (
    <AdminLayout title="Payments">
      <div className="mb-4 grid grid-cols-3 gap-3">
        {([['Gross collected', sum('gross')], ['Commission', sum('commission')], ['Technician payouts', sum('payout')]] as const).map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-surface p-4"><p className="text-[12px] text-text-muted">{k}</p><p className="mt-1 font-mono text-xl font-semibold">{rupee(v)}</p></div>))}
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(['all', 'successful', 'pending', 'refunded', 'failed'] as const).map((x) => (
          <button key={x} onClick={() => setS(x)} className={cx('h-8 rounded-full border px-3 text-[12.5px] font-semibold capitalize', s === x ? 'border-primary bg-primary text-white' : 'border-border-strong bg-surface text-text-secondary')}>{x}</button>))}
      </div>
      {loading ? <Skeleton className="h-72" /> : (
        <Table head={['Transaction ID', 'Booking', 'Customer', 'Technician', 'Gross', 'Commission', 'Payout', 'Status']} empty={!list.length}>
          {list.map((t) => (
            <tr key={t.id} className="hover:bg-sunken/40">
              <Td className="font-mono">{t.id}</Td><Td className="font-mono text-primary">{t.bookingId}</Td><Td>{t.customer}</Td><Td>{t.technician}</Td>
              <Td className="font-mono">{rupee(t.gross)}</Td><Td className="font-mono text-text-secondary">{rupee(t.commission)}</Td><Td className="font-mono">{rupee(t.payout)}</Td><Td><PaymentBadge status={t.status} /></Td>
            </tr>))}
        </Table>
      )}
    </AdminLayout>
  )
}

/* ---------- Disputes ---------- */
export function AdminDisputes() {
  const toast = useToast()
  const { data, loading, reload } = useAsync(() => adminService.disputes())
  const [open, setOpen] = useState<Dispute | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)
  return (
    <AdminLayout title="Disputes">
      {loading ? <Skeleton className="h-60" /> : (
        <Table head={['Dispute ID', 'Booking', 'Customer', 'Technician', 'Reason', 'Amount', 'Status', 'Created']}>
          {data!.map((d) => (
            <tr key={d.id} onClick={() => setOpen(d)} className="cursor-pointer hover:bg-sunken/40">
              <Td className="font-mono font-medium text-primary">{d.id}</Td><Td className="font-mono">{d.bookingId}</Td><Td>{d.customer}</Td><Td>{d.technician}</Td>
              <Td className="max-w-[260px] truncate">{d.reason}</Td><Td className="font-mono">{rupee(d.amount)}</Td><Td><DisputeBadge status={d.status} /></Td><Td className="text-text-muted">{d.created}</Td>
            </tr>))}
        </Table>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} side="right" title={open ? `${open.id} · ${open.reason}` : ''}
        footer={open && open.status !== 'closed' && open.status !== 'resolved' ? (
          <div className="grid w-full grid-cols-2 gap-2">
            {['Refund', 'Partial refund', 'Credit', 'Close dispute'].map((a) => <Button key={a} size="sm" variant={a === 'Refund' ? 'primary' : 'secondary'} onClick={() => setConfirm(a)}>{a}</Button>)}
          </div>) : undefined}>
        {open && (
          <div className="space-y-5 text-[13px]">
            <div className="flex items-center gap-2"><DisputeBadge status={open.status} /><span className="text-text-muted">Opened {open.created}</span></div>
            <div><p className="mb-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">Customer evidence · {open.customer}</p><p className="rounded-md bg-sunken p-3 leading-relaxed">{open.customerEvidence}</p></div>
            <div><p className="mb-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">Technician notes · {open.technician}</p><p className="rounded-md bg-sunken p-3 leading-relaxed">{open.technicianNotes}</p></div>
            <dl className="divide-y divide-border rounded-lg border border-border">
              {[['Booking', open.bookingId], ['Session length', '22 min'], ['Paid', rupee(open.amount)], ['Technician payout', `${rupee(Math.round(open.amount * 0.8))} (on hold)`]].map(([k, v]) => <div key={k} className="flex justify-between px-4 py-2.5"><dt className="text-text-muted">{k}</dt><dd className="font-mono">{v}</dd></div>)}
            </dl>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} title={`${confirm} for ${open?.id}?`} confirmLabel={confirm ?? ''} danger={confirm === 'Refund'}
        body={confirm === 'Refund' ? `${rupee(open?.amount ?? 0)} goes back to ${open?.customer} within 5–7 working days. The technician payout will be reversed.` : confirm === 'Partial refund' ? `50% (${rupee(Math.round((open?.amount ?? 0) / 2))}) is refunded. The technician keeps the rest.` : confirm === 'Credit' ? `${open?.customer} gets ${rupee(open?.amount ?? 0)} Setu credit for their next booking.` : 'The dispute is closed with no money moved. Both parties are notified.'}
        onConfirm={async () => { await adminService.resolveDispute(open!.id, confirm === 'Close dispute' ? 'closed' : 'resolved'); toast(`${open!.id}: ${confirm} applied`, 'success'); setOpen(null); reload() }} />
    </AdminLayout>
  )
}

/* ---------- Simple sections ---------- */
export function AdminCustomers() {
  const { data, loading } = useAsync(() => adminService.customers())
  return (
    <AdminLayout title="Customers">
      {loading ? <Skeleton className="h-60" /> : (
        <Table head={['Customer ID', 'Name', 'City', 'Bookings', 'Total spent', 'Joined']}>
          {data!.map((c) => <tr key={c.id} className="hover:bg-sunken/40"><Td className="font-mono">{c.id}</Td><Td className="font-semibold">{c.name}</Td><Td>{c.city}</Td><Td className="font-mono">{c.bookings}</Td><Td className="font-mono">{rupee(c.spent)}</Td><Td className="text-text-muted">{c.joined}</Td></tr>)}
        </Table>
      )}
    </AdminLayout>
  )
}

export function AdminReviews() {
  const rows = TECHNICIANS.flatMap((t) => t.reviews.map((r) => ({ ...r, tech: t.name })))
  return (
    <AdminLayout title="Reviews">
      <Table head={['Customer', 'Technician', 'Rating', 'Review', 'Date']}>
        {rows.map((r) => <tr key={r.id}><Td className="font-semibold">{r.author}</Td><Td>{r.tech}</Td><Td className="font-mono">{'★'.repeat(r.rating)}</Td><Td className="max-w-[380px] truncate text-text-secondary">{r.text}</Td><Td className="text-text-muted">{r.date}</Td></tr>)}
      </Table>
    </AdminLayout>
  )
}

export function AdminSettings({ commission }: { commission?: boolean }) {
  const toast = useToast()
  const [rate, setRate] = useState(String(PRICING.commissionRate * 100))
  const [fee, setFee] = useState(String(PRICING.platformFee))
  return (
    <AdminLayout title={commission ? 'Commission' : 'Settings'}>
      <Panel title="Pricing rules" sub="Applied to new bookings only. Changes are logged." className="max-w-xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-[13px]"><span className="mb-1.5 block font-semibold text-text-secondary">Commission (%)</span><input value={rate} onChange={(e) => setRate(e.target.value)} className="h-10 w-full rounded-sm border border-border-strong px-3 font-mono outline-none focus:border-primary" /></label>
          <label className="text-[13px]"><span className="mb-1.5 block font-semibold text-text-secondary">Customer platform fee (₹)</span><input value={fee} onChange={(e) => setFee(e.target.value)} className="h-10 w-full rounded-sm border border-border-strong px-3 font-mono outline-none focus:border-primary" /></label>
        </div>
        <Button className="mt-5" onClick={() => toast('Saved. Applies from the next booking.', 'success')}>Save changes</Button>
      </Panel>
    </AdminLayout>
  )
}

export function AdminLogin() {
  const { navigate } = useRouter()
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-raised">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Setu Operations</p>
        <h1 className="mt-2 text-xl font-bold">Sign in</h1>
        <div className="mt-6 space-y-3">
          <input defaultValue="aditi@setu.in" className="h-11 w-full rounded-md border border-border-strong px-3 text-sm outline-none focus:border-primary" aria-label="Email" />
          <input type="password" defaultValue="password" className="h-11 w-full rounded-md border border-border-strong px-3 text-sm outline-none focus:border-primary" aria-label="Password" />
          <Button block onClick={() => navigate('/admin')}>Continue with SSO</Button>
        </div>
      </div>
    </div>
  )
}
