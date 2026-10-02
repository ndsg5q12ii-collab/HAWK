import type { NavItem } from '../../layouts/MobileLayout'

export const CUSTOMER_NAV: NavItem[] = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/bookings', label: 'Bookings', icon: 'calendar', match: ['/booking'] },
  { to: '/devices', label: 'Devices', icon: 'devices' },
  { to: '/profile', label: 'Profile', icon: 'user' },
]

export const TECH_NAV: NavItem[] = [
  { to: '/technician/home', label: 'Home', icon: 'home' },
  { to: '/technician/requests', label: 'Requests', icon: 'bell' },
  { to: '/technician/bookings', label: 'Bookings', icon: 'calendar' },
  { to: '/technician/earnings', label: 'Earnings', icon: 'wallet' },
  { to: '/technician/profile', label: 'Profile', icon: 'user' },
]
