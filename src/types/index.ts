import type { IconName } from '../components/icons'

export type DeviceCategory = 'laptop' | 'pc' | 'phone' | 'tablet' | 'wifi' | 'tv' | 'printer' | 'other'

export type BookingStatus = 'requested' | 'accepted' | 'waiting' | 'active' | 'completed' | 'cancelled' | 'disputed' | 'refunded'
export type ServiceType = 'remote' | 'visit'
export type TechAvailability = 'offline' | 'available' | 'busy'
export type VerificationStatus = 'verified' | 'pending' | 'suspended' | 'rejected'
export type PaymentStatus = 'successful' | 'pending' | 'refunded' | 'failed'
export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed'

export interface CategoryInfo {
  id: DeviceCategory
  label: string
  icon: IconName
}

export interface Review {
  id: string
  author: string
  rating: number
  text: string
  date: string
  tags: string[]
}

export interface Technician {
  id: string
  name: string
  initials: string
  verification: VerificationStatus
  availability: TechAvailability
  skills: string[]
  categories: DeviceCategory[]
  rating: number
  sessions: number
  responseMins: number
  remotePrice: number
  visitFee: number
  experienceYears: number
  area: string
  about: string
  languages: string[]
  reviews: Review[]
  recentWork: string[]
  joined: string
}

export interface Booking {
  id: string
  customer: string
  technicianId: string
  technicianName: string
  category: DeviceCategory
  device: string
  problem: string
  service: ServiceType
  date: string
  time: string
  status: BookingStatus
  amount: number
  area: string
}

export interface Device {
  id: string
  category: DeviceCategory
  brand: string
  model: string
  lastSession: string | null
}

export interface Transaction {
  id: string
  bookingId: string
  customer: string
  technician: string
  gross: number
  commission: number
  payout: number
  status: PaymentStatus
  date: string
}

export interface Dispute {
  id: string
  bookingId: string
  customer: string
  technician: string
  reason: string
  amount: number
  status: DisputeStatus
  created: string
  customerEvidence: string
  technicianNotes: string
}

export interface TechRequest {
  id: string
  customer: string
  category: DeviceCategory
  device: string
  problem: string
  service: ServiceType
  price: number
  estMins: number
  area: string
  photos: number
}

export interface Pricing {
  platformFee: number
  gstRate: number
  commissionRate: number
}
