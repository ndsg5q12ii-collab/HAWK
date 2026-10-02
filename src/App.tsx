import { lazy, Suspense, type ReactNode } from 'react'
import { BrandMark, Icon, type IconName } from './components/icons'
import { ToastProvider } from './components/ui'
import { RouterProvider, matchPath, useRouter } from './lib/router'
import { AppStateProvider } from './state/AppState'
import { Login, Onboarding, Splash } from './pages/customer/Auth'
import { DeviceSelect, Home, Problem } from './pages/customer/Home'
import { Matching, Results, TechnicianProfile } from './pages/customer/Find'
import { BookingDetail, BookingPage, Confirmed, Waiting } from './pages/customer/Booking'
import { Arrival, Payment, Resolution, VideoSession, Visit } from './pages/customer/Session'
import { Bookings, Devices, Profile, ReviewPage } from './pages/customer/Account'
import { TechBookings, TechEarnings, TechHome, TechOnboarding, TechProfile, TechRequests, TechSession } from './pages/technician/Technician'

const A = (k: string) => lazy(() => import('./pages/admin/Admin').then((m) => ({ default: (m as unknown as Record<string, React.ComponentType<any>>)[k] })))
const Admin = {
  Dashboard: A('AdminDashboard'), Technicians: A('AdminTechnicians'), TechDetail: A('AdminTechnicianDetail'), Bookings: A('AdminBookings'),
  Payments: A('AdminPayments'), Disputes: A('AdminDisputes'), Customers: A('AdminCustomers'), Reviews: A('AdminReviews'), Settings: A('AdminSettings'), Login: A('AdminLogin'),
}

type R = [string, (p: Record<string, string>) => ReactNode]
const ROUTES: R[] = [
  ['/', () => <Launcher />],
  ['/splash', () => <Splash />], ['/welcome', () => <Onboarding />], ['/login', () => <Login />],
  ['/home', () => <Home />], ['/help', () => <DeviceSelect />], ['/problem', () => <Problem />], ['/matching', () => <Matching />],
  ['/technicians', () => <Results />],
  ['/technician/home', () => <TechHome />], ['/technician/requests', () => <TechRequests />], ['/technician/bookings', () => <TechBookings />],
  ['/technician/session/:id', (p) => <TechSession id={p.id} />], ['/technician/earnings', () => <TechEarnings />],
  ['/technician/profile', () => <TechProfile />], ['/technician/onboarding', () => <TechOnboarding />],
  ['/technician/:id', (p) => <TechnicianProfile id={p.id} />],
  ['/booking', () => <BookingPage />], ['/booking/confirmed', () => <Confirmed />], ['/booking/:id', (p) => <BookingDetail id={p.id} />],
  ['/waiting/:id', (p) => <Waiting id={p.id} />], ['/session/:id', (p) => <VideoSession id={p.id} />], ['/resolution/:id', (p) => <Resolution id={p.id} />],
  ['/visit', () => <Visit />], ['/arrival/:id', (p) => <Arrival id={p.id} />], ['/payment', () => <Payment />], ['/review', () => <ReviewPage />],
  ['/bookings', () => <Bookings />], ['/devices', () => <Devices />], ['/profile', () => <Profile />],
  ['/admin', () => <Admin.Dashboard />], ['/admin/login', () => <Admin.Login />], ['/admin/technicians', () => <Admin.Technicians />],
  ['/admin/technicians/:id', (p) => <Admin.TechDetail id={p.id} />], ['/admin/bookings', () => <Admin.Bookings />],
  ['/admin/sessions', () => <Admin.Bookings sessionsOnly />], ['/admin/payments', () => <Admin.Payments />], ['/admin/disputes', () => <Admin.Disputes />],
  ['/admin/customers', () => <Admin.Customers />], ['/admin/reviews', () => <Admin.Reviews />],
  ['/admin/commission', () => <Admin.Settings commission />], ['/admin/settings', () => <Admin.Settings />],
]

function Routes() {
  const { path } = useRouter()
  const clean = path.split('?')[0]
  for (const [pattern, render] of ROUTES) {
    const p = matchPath(pattern, clean)
    if (p) return <Suspense fallback={<div className="min-h-screen bg-background" />}>{render(p)}</Suspense>
  }
  return <NotFound />
}

function NotFound() {
  const { navigate } = useRouter()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center">
      <p className="font-mono text-sm text-text-muted">404</p>
      <h1 className="text-xl font-bold">This page doesn't exist</h1>
      <button onClick={() => navigate('/')} className="mt-2 h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white">Back to start</button>
    </div>
  )
}

function Launcher() {
  const { navigate } = useRouter()
  const apps: [string, string, string, IconName, string, string][] = [
    ['Customer app', 'Get a laptop, phone or Wi-Fi problem fixed over video, or book a visit.', 'Home → Problem → Match → Video → Pay → Review', 'user', '/splash', 'Mobile'],
    ['Technician app', 'Go online, accept requests, run sessions and track earnings.', 'Home → Request → Accept → Session → Earnings', 'wrench', '/technician/home', 'Mobile'],
    ['Admin console', 'Verify technicians, watch bookings, settle payments and disputes.', 'Dashboard → Technicians → Bookings → Disputes', 'grid', '/admin', 'Desktop'],
  ]
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <div className="flex items-center gap-2.5"><BrandMark size={30} /><span className="text-lg font-extrabold tracking-tight">Setu</span></div>
        <h1 className="mt-10 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">Verified tech help, a video call away.</h1>
        <p className="mt-4 max-w-xl text-text-secondary">A clickable prototype of the Setu marketplace. It has three surfaces sharing one mock backend. All people and places are fictional and set in Delhi NCR.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {apps.map(([t, d, flow, icon, to, kind], i) => (
            <button key={t} onClick={() => navigate(to)} style={{ animationDelay: `${i * 70}ms` }}
              className="group flex flex-col rounded-lg border border-border bg-surface p-6 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-raised animate-fade-up">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary"><Icon name={icon} size={20} /></span>
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-muted">{kind}</span>
              </div>
              <h2 className="mt-6 text-lg font-bold">{t}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-text-secondary">{d}</p>
              <p className="mt-6 border-t border-border pt-4 font-mono text-[11px] leading-relaxed text-text-muted">{flow}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open<Icon name="chevronRight" size={16} /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <RouterProvider>
      <AppStateProvider>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </AppStateProvider>
    </RouterProvider>
  )
}
