import { useEffect, useState } from 'react'
import { BrandMark, Icon } from '../../components/icons'
import { Button, Field, Input, OtpInput, Stepper } from '../../components/ui'
import { MobileShell, Screen } from '../../layouts/MobileLayout'
import { useRouter } from '../../lib/router'
import { authService } from '../../services'
import { useApp } from '../../state/AppState'

export function Splash() {
  const { navigate } = useRouter()
  const { onboarded } = useApp()
  useEffect(() => {
    const t = setTimeout(() => navigate(onboarded ? '/login' : '/welcome'), 1600)
    return () => clearTimeout(t)
  }, [navigate, onboarded])
  return (
    <MobileShell>
      <button onClick={() => navigate('/welcome')} className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center" aria-label="Continue">
        <span className="animate-reveal"><BrandMark size={64} /></span>
        <div className="animate-fade-up [animation-delay:400ms]">
          <p className="text-3xl font-extrabold tracking-tight">Setu</p>
          <p className="mt-2 text-[15px] text-text-secondary">Technical help, when you need it.</p>
        </div>
      </button>
      <p className="pb-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">Delhi · Noida · Gurugram · Ghaziabad</p>
    </MobileShell>
  )
}

const SLIDES = [
  { title: 'Something broken?', body: 'Describe the problem in your own words. No technical knowledge needed.', art: 'problem' },
  { title: 'Talk to a verified technician.', body: 'Most problems are solved on a video call in under 30 minutes.', art: 'video' },
  { title: 'Need hands-on help?', body: "If it can't be fixed remotely, your technician can visit you.", art: 'visit' },
] as const

function SlideArt({ kind }: { kind: (typeof SLIDES)[number]['art'] }) {
  // Quiet line compositions in brand colour — not stock illustrations.
  return (
    <svg viewBox="0 0 280 200" className="h-auto w-full max-w-[300px]" aria-hidden>
      <rect x="0" y="0" width="280" height="200" rx="16" fill="var(--color-primary-soft)" />
      {kind === 'problem' && (
        <g fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="70" y="50" width="140" height="88" rx="6" fill="#fff" />
          <path d="M52 150h176" />
          <path d="M126 82l28 28M154 82l-28 28" stroke="var(--color-error)" />
          <circle cx="216" cy="44" r="18" fill="#fff" />
          <path d="M210 40a6 6 0 1 1 8 5.6V50M216 55h.01" />
        </g>
      )}
      {kind === 'video' && (
        <g fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="56" y="36" width="168" height="112" rx="10" fill="var(--color-ink)" stroke="none" />
          <circle cx="140" cy="80" r="18" stroke="#9fa6f0" />
          <path d="M108 128c4-14 18-22 32-22s28 8 32 22" stroke="#9fa6f0" />
          <rect x="176" y="104" width="38" height="34" rx="5" fill="#fff" stroke="none" />
          <path d="M112 166h56" />
          <circle cx="98" cy="166" r="8" fill="#fff" />
          <circle cx="182" cy="166" r="8" fill="var(--color-error)" stroke="none" />
          <rect x="70" y="46" width="44" height="14" rx="7" fill="var(--color-success)" stroke="none" />
        </g>
      )}
      {kind === 'visit' && (
        <g fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M150 150V92l40-30 40 30v58z" fill="#fff" />
          <path d="M180 150v-28h20v28" />
          <path d="M40 150h210" />
          <path d="M60 150c0-30 50-60 80-60" strokeDasharray="4 7" />
          <circle cx="60" cy="118" r="12" fill="#fff" />
          <path d="M56 118l3 3 6-6" stroke="var(--color-success)" />
        </g>
      )}
    </svg>
  )
}

export function Onboarding() {
  const { navigate } = useRouter()
  const { setOnboarded } = useApp()
  const [i, setI] = useState(0)
  const finish = () => { setOnboarded(true); navigate('/login') }
  const s = SLIDES[i]
  return (
    <MobileShell>
      <Screen>
        <div className="flex items-center justify-between">
          <div className="w-24"><Stepper total={3} current={i} /></div>
          <button onClick={finish} className="rounded-sm px-2 py-1 text-sm font-semibold text-text-muted hover:text-text-primary">Skip</button>
        </div>
        <div key={i} className="flex flex-1 flex-col justify-center animate-fade-up">
          <div className="flex justify-center"><SlideArt kind={s.art} /></div>
          <h1 className="mt-10 text-[28px] font-extrabold leading-tight tracking-tight">{s.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-text-secondary">{s.body}</p>
        </div>
        <Button size="lg" block onClick={() => (i < 2 ? setI(i + 1) : finish())}>{i < 2 ? 'Next' : 'Get Started'}</Button>
      </Screen>
    </MobileShell>
  )
}

export function Login() {
  const { navigate } = useRouter()
  const { setUserName } = useApp()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [timer, setTimer] = useState(30)

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return
    const t = setTimeout(() => setTimer(timer - 1), 1000)
    return () => clearTimeout(t)
  }, [step, timer])

  const send = async () => {
    setBusy(true); setError(undefined)
    try { await authService.sendOtp(phone); setStep('otp'); setTimer(30); setOtp('') } catch (e) { setError((e as Error).message) }
    setBusy(false)
  }
  const verify = async () => {
    setBusy(true); setError(undefined)
    try { const u = await authService.verifyOtp(otp); setUserName(u.name); navigate('/home') } catch (e) { setError((e as Error).message) }
    setBusy(false)
  }

  return (
    <MobileShell>
      <Screen>
        <BrandMark size={40} />
        {step === 'phone' ? (
          <>
            <h1 className="mt-8 text-[26px] font-extrabold tracking-tight">Enter your mobile number</h1>
            <p className="mt-2 text-[15px] text-text-secondary">We'll send you a 6-digit code to sign in.</p>
            <div className="mt-8">
              <Field label="Mobile number" error={error}>
                <div className="flex gap-2">
                  <span className="inline-flex h-12 items-center rounded-md border border-border-strong bg-sunken px-3.5 font-mono text-[15px] font-medium">+91</span>
                  <Input inputMode="numeric" autoFocus placeholder="98765 43210" value={phone} invalid={!!error}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(undefined) }}
                    onKeyDown={(e) => e.key === 'Enter' && phone.length === 10 && send()} className="font-mono" />
                </div>
              </Field>
            </div>
            <div className="mt-auto pt-6">
              <Button size="lg" block disabled={phone.length !== 10} loading={busy} onClick={send}>Continue</Button>
              <p className="mt-4 text-center text-xs leading-relaxed text-text-muted">By continuing you agree to Setu's Terms and Privacy Policy. We never share your number with technicians.</p>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-8 text-[26px] font-extrabold tracking-tight">Enter the code</h1>
            <p className="mt-2 text-[15px] text-text-secondary">
              Sent to <span className="font-mono font-medium text-text-primary">+91 {phone.slice(0, 5)} {phone.slice(5)}</span>{' '}
              <button onClick={() => { setStep('phone'); setError(undefined) }} className="font-semibold text-primary hover:underline">Change number</button>
            </p>
            <div className="mt-8">
              <OtpInput value={otp} invalid={!!error} onChange={(v) => { setOtp(v); setError(undefined) }} />
              {error && <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-error"><Icon name="alert" size={15} />{error}</p>}
              <p className="mt-4 text-sm text-text-muted">
                {timer > 0 ? <>Resend code in <span className="font-mono">0:{String(timer).padStart(2, '0')}</span></> : <button onClick={send} className="font-semibold text-primary hover:underline">Resend code</button>}
              </p>
              <p className="mt-6 rounded-sm bg-sunken px-3 py-2 font-mono text-[11px] text-text-muted">Demo: any code works · 000000 shows the error state</p>
            </div>
            <div className="mt-auto pt-6"><Button size="lg" block disabled={otp.length !== 6} loading={busy} onClick={verify}>Verify and continue</Button></div>
          </>
        )}
      </Screen>
    </MobileShell>
  )
}
