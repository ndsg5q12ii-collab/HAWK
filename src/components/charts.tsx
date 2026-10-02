import { useState } from 'react'

// Lightweight SVG charts — one series emphasis, hairline grid, direct labels, hover readout.
type Pt = { label: string; value: number }

export function BarChart({ data, format = String, height = 180 }: { data: { label: string; a: number; b: number }[]; format?: (n: number) => string; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => d.a + d.b)) * 1.1
  const W = 560, H = height, pad = 24, bw = (W - pad) / data.length
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" role="img" aria-label="Stacked bar chart of remote and in-person sessions">
        {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={pad} x2={W} y1={H - H * g} y2={H - H * g} stroke="var(--color-border)" strokeDasharray={g === 1 ? '' : '2 4'} />)}
        {[0.5, 1].map((g) => <text key={g} x={0} y={H - H * g + 4} fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">{Math.round(max * g)}</text>)}
        {data.map((d, i) => {
          const ha = (d.a / max) * H, hb = (d.b / max) * H, x = pad + i * bw + bw * 0.18, w = bw * 0.64
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} opacity={hover === null || hover === i ? 1 : 0.45} className="transition-opacity">
              <rect x={pad + i * bw} y={0} width={bw} height={H} fill="transparent" />
              <rect x={x} y={H - ha} width={w} height={ha} rx={2} fill="var(--color-primary)" />
              <rect x={x} y={H - ha - hb - 1.5} width={w} height={hb} rx={2} fill="#9fa6f0" />
              {i % 2 === 0 && <text x={x + w / 2} y={H + 16} fontSize="10" textAnchor="middle" fill="var(--color-text-muted)">{d.label}</text>}
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 rounded-sm border border-border bg-surface px-2.5 py-1.5 text-xs shadow-raised" style={{ left: `${((hover + 0.5) / data.length) * 92}%` }}>
          <p className="font-semibold">{data[hover].label}</p>
          <p className="font-mono">Remote {format(data[hover].a)} · Visit {format(data[hover].b)}</p>
        </div>
      )}
    </div>
  )
}

export function LineChart({ data, format = String, height = 160, color = 'var(--color-primary)', domain }: { data: Pt[]; format?: (n: number) => string; height?: number; color?: string; domain?: [number, number] }) {
  const [hover, setHover] = useState<number | null>(null)
  const vals = data.map((d) => d.value)
  const [lo, hi] = domain ?? [Math.min(...vals) * 0.9, Math.max(...vals) * 1.05]
  const W = 560, H = height
  const x = (i: number) => (i / (data.length - 1)) * W
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join('')
  const last = data[data.length - 1]
  return (
    <div className="relative">
      <svg viewBox={`-4 -8 ${W + 8} ${H + 30}`} className="w-full" role="img" aria-label="Line chart" onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((g) => <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="var(--color-border)" strokeDasharray={g === 1 ? '' : '2 4'} />)}
        <path d={`${line}L${W},${H}L0,${H}Z`} fill={color} opacity="0.07" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => (
          <rect key={i} x={x(i) - W / data.length / 2} y={-8} width={W / data.length} height={H + 8} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && <><line x1={x(hover)} x2={x(hover)} y1={0} y2={H} stroke="var(--color-border-strong)" /><circle cx={x(hover)} cy={y(data[hover].value)} r="4" fill="var(--color-surface)" stroke={color} strokeWidth="2" /></>}
        <circle cx={x(data.length - 1)} cy={y(last.value)} r="3.5" fill={color} />
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => <text key={i} x={x(i)} y={H + 18} fontSize="10" textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'} fill="var(--color-text-muted)">{data[i].label}</text>)}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute -top-2 rounded-sm border border-border bg-surface px-2.5 py-1.5 text-xs shadow-raised" style={{ left: `min(${(hover / (data.length - 1)) * 100}%, calc(100% - 110px))` }}>
          <span className="text-text-muted">{data[hover].label}</span> <span className="font-mono font-semibold">{format(data[hover].value)}</span>
        </div>
      )}
    </div>
  )
}

export function Meter({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]"><span className="text-text-secondary">{label}</span><span className="font-mono font-semibold">{Math.round(value * 100)}%</span></div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sunken"><div className="h-full rounded-full bg-primary" style={{ width: `${value * 100}%` }} /></div>
    </div>
  )
}
