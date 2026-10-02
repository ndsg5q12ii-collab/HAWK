import { useEffect, useState, type ReactNode } from 'react'
import { Icon, type IconName } from './icons'
import { Avatar, Button, cx } from './ui'

export function useTimer(running = true) {
  const [s, setS] = useState(0)
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setS((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [running])
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function Control({ icon, label, active = true, onClick, danger }: { icon: IconName; label: string; active?: boolean; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5" aria-pressed={!danger ? !active : undefined}>
      <span className={cx('inline-flex size-12 items-center justify-center rounded-full transition-colors',
        danger ? 'bg-error text-white hover:brightness-110' : active ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white text-ink')}>
        <Icon name={icon} size={21} />
      </span>
      <span className="text-[11px] font-medium text-white/70">{label}</span>
    </button>
  )
}

// Shared dark session surface used by both customer and technician apps.
export function VideoStage({
  remote, selfInitials, header, side, onEnd, endLabel = 'End', onChat, disconnected, onReconnect, extraControls,
}: {
  remote: { name: string; initials: string; caption: string }
  selfInitials: string
  header: ReactNode
  side?: ReactNode
  onEnd: () => void
  endLabel?: string
  onChat: () => void
  disconnected?: boolean
  onReconnect?: () => void
  extraControls?: ReactNode
}) {
  const [mic, setMic] = useState(true)
  const [cam, setCam] = useState(true)
  const [spk, setSpk] = useState(true)
  const [share, setShare] = useState(false)
  return (
    <div className="flex flex-1 flex-col bg-ink text-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3">{header}</div>
      <div className="relative mx-3 flex-1 overflow-hidden rounded-lg bg-ink-2" style={{ minHeight: 360 }}>
        {/* remote feed placeholder: soft vignette + avatar, no fake video */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#2a2f4a_0%,#161925_70%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Avatar initials={remote.initials} size={88} />
          <p className="text-sm text-white/60">{share ? 'You are sharing your screen' : remote.caption}</p>
        </div>
        <div className="absolute bottom-3 left-3 rounded-sm bg-black/40 px-2 py-1 text-xs font-medium backdrop-blur">{remote.name}{!mic && ' · you are muted'}</div>
        <div className="absolute right-3 top-3 flex h-36 w-24 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-ink-3">
          {cam ? <Avatar initials={selfInitials} size={44} /> : <Icon name="videoOff" size={22} className="text-white/50" />}
          <span className="absolute bottom-1.5 left-1.5 text-[10px] text-white/60">You</span>
        </div>
        {disconnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/85 px-8 text-center backdrop-blur-sm animate-fade-up">
            <Icon name="wifiOff" size={30} className="text-[#ffb36b]" />
            <p className="font-semibold">Connection lost</p>
            <p className="text-sm text-white/60">Your internet dropped for a moment. The session timer is paused and you won't be charged for this time.</p>
            <Button onClick={onReconnect} icon="refresh">Reconnect</Button>
          </div>
        )}
      </div>
      {side}
      <div className="flex items-start justify-around px-4 pb-6 pt-5">
        <Control icon={mic ? 'mic' : 'micOff'} label={mic ? 'Mute' : 'Unmute'} active={mic} onClick={() => setMic(!mic)} />
        <Control icon={cam ? 'video' : 'videoOff'} label="Camera" active={cam} onClick={() => setCam(!cam)} />
        <Control icon="speaker" label="Speaker" active={spk} onClick={() => setSpk(!spk)} />
        <Control icon="screen" label="Share" active={!share} onClick={() => setShare(!share)} />
        <Control icon="chat" label="Chat" onClick={onChat} />
        {extraControls}
        <Control icon="phoneOff" label={endLabel} danger onClick={onEnd} />
      </div>
    </div>
  )
}
