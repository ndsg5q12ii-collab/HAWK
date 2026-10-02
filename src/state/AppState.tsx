import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Booking, DeviceCategory, ServiceType, TechAvailability } from '../types'

export interface Draft {
  category: DeviceCategory
  description: string
  brand: string
  model: string
  attachments: string[]
}

interface AppState {
  userName: string | null
  setUserName: (n: string | null) => void
  onboarded: boolean
  setOnboarded: (b: boolean) => void
  draft: Draft
  setDraft: (d: Partial<Draft>) => void
  technicianId: string | null
  setTechnicianId: (id: string | null) => void
  booking: Booking | null
  setBooking: (b: Booking | null) => void
  checkout: { service: ServiceType; base: number } | null
  setCheckout: (c: { service: ServiceType; base: number } | null) => void
  techAvailability: TechAvailability
  setTechAvailability: (a: TechAvailability) => void
  techAccepted: string[]
  acceptRequest: (id: string) => void
}

const Ctx = createContext<AppState | null>(null)

const emptyDraft: Draft = { category: 'laptop', description: '', brand: 'Dell', model: '', attachments: [] }

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null)
  const [onboarded, setOnboarded] = useState(false)
  const [draft, setDraftState] = useState<Draft>(emptyDraft)
  const [technicianId, setTechnicianId] = useState<string | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [checkout, setCheckout] = useState<AppState['checkout']>(null)
  const [techAvailability, setTechAvailability] = useState<TechAvailability>('available')
  const [techAccepted, setTechAccepted] = useState<string[]>([])
  return (
    <Ctx.Provider
      value={{
        userName, setUserName, onboarded, setOnboarded,
        draft, setDraft: (d) => setDraftState((x) => ({ ...x, ...d })),
        technicianId, setTechnicianId, booking, setBooking, checkout, setCheckout,
        techAvailability, setTechAvailability, techAccepted, acceptRequest: (id) => setTechAccepted((x) => [...x, id]),
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useApp() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp outside provider')
  return c
}
