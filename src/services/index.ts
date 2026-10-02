// Mock service layer. Each function mirrors an eventual API call; swap internals for fetch() later.
import type { Booking, Technician, Transaction, VerificationStatus } from '../types'
import * as db from './mock/data'

const delay = <T,>(value: T, ms = 450): Promise<T> => new Promise((r) => setTimeout(() => r(structuredClone(value)), ms))

export const authService = {
  sendOtp: (phone: string) => (/^[6-9]\d{9}$/.test(phone) ? delay({ ok: true }) : Promise.reject(new Error("That number doesn't look right. Use a 10-digit mobile number."))),
  // Demo: any code except 000000 works.
  verifyOtp: (code: string) => delay(null, 600).then(() => {
    if (code === '000000') throw new Error("That code doesn't look right. Try again.")
    return { name: 'Niladri' }
  }),
}

export const catalogService = {
  categories: () => db.CATEGORIES,
  category: (id: string) => db.CATEGORIES.find((c) => c.id === id) ?? db.CATEGORIES[7],
  pricing: () => db.PRICING,
}

export const technicianService = {
  list: () => delay(db.TECHNICIANS),
  match: (category: string) => delay(db.TECHNICIANS.filter((t) => t.verification === 'verified' && t.categories.includes(category as never)), 300),
  get: (id: string) => db.TECHNICIANS.find((t) => t.id === id),
  setVerification: (id: string, status: VerificationStatus) => {
    const t = db.TECHNICIANS.find((x) => x.id === id)
    if (t) t.verification = status
    return delay(t as Technician, 350)
  },
  requests: () => delay(db.TECH_REQUESTS, 300),
}

export const bookingService = {
  list: () => delay(db.BOOKINGS),
  forCustomer: (name: string) => delay(db.BOOKINGS.filter((b) => b.customer === name), 350),
  forTechnician: (id: string) => delay(db.BOOKINGS.filter((b) => b.technicianId === id), 350),
  get: (id: string) => db.BOOKINGS.find((b) => b.id === id),
  create: (b: Omit<Booking, 'id'>) => {
    const booking = { ...b, id: `STU-${48300 + db.BOOKINGS.length}` }
    db.BOOKINGS.unshift(booking)
    return delay(booking, 700)
  },
  update: (id: string, patch: Partial<Booking>) => {
    const b = db.BOOKINGS.find((x) => x.id === id)
    if (b) Object.assign(b, patch)
    return delay(b as Booking, 250)
  },
}

export const paymentService = {
  quote: (base: number) => {
    const fee = db.PRICING.platformFee
    const gst = Math.round((base + fee) * db.PRICING.gstRate)
    return { base, fee, gst, total: base + fee + gst }
  },
  pay: (_amount: number, method: string, simulateFailure: boolean) =>
    delay(null, 1100).then(() => {
      if (simulateFailure) throw new Error(`Your ${method} payment didn't go through. No money was taken.`)
      return { txn: `TXN-${Math.floor(Math.random() * 90000 + 10000)}` }
    }),
  transactions: () => delay<Transaction[]>(db.TRANSACTIONS),
}

export const reviewService = {
  submit: (_r: { rating: number; tags: string[]; text: string }) => delay({ ok: true }, 600),
}

export const deviceService = {
  list: () => delay(db.DEVICES, 300),
  add: (d: Omit<(typeof db.DEVICES)[number], 'id'>) => {
    const dev = { ...d, id: `d${Date.now()}` }
    db.DEVICES.push(dev)
    return delay(dev, 300)
  },
}

export const adminService = {
  daily: () => db.DAILY,
  activity: () => db.ACTIVITY,
  customers: () => delay(db.CUSTOMERS, 300),
  disputes: () => delay(db.DISPUTES),
  resolveDispute: (id: string, status: 'resolved' | 'closed') => {
    const d = db.DISPUTES.find((x) => x.id === id)
    if (d) d.status = status
    return delay(d, 300)
  },
}

export const rupee = (n: number) => `₹${n.toLocaleString('en-IN')}`
