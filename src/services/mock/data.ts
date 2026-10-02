// MOCK DATA — prototype only. Every value here is replaced by backend responses in production.
import type { Booking, CategoryInfo, Device, Dispute, Pricing, TechRequest, Technician, Transaction } from '../../types'

export const CATEGORIES: CategoryInfo[] = [
  { id: 'laptop', label: 'Laptop', icon: 'laptop' },
  { id: 'pc', label: 'Desktop PC', icon: 'pc' },
  { id: 'phone', label: 'Phone', icon: 'phone' },
  { id: 'tablet', label: 'Tablet', icon: 'tablet' },
  { id: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
  { id: 'tv', label: 'TV', icon: 'tv' },
  { id: 'printer', label: 'Printer', icon: 'printer' },
  { id: 'other', label: 'Other', icon: 'other' },
]

export const PRICING: Pricing = { platformFee: 29, gstRate: 0.18, commissionRate: 0.2 }

export const TECHNICIANS: Technician[] = [
  {
    id: 't-rahul', name: 'Rahul Kumar', initials: 'RK', verification: 'verified', availability: 'available',
    skills: ['Laptop', 'Windows', 'PC'], categories: ['laptop', 'pc', 'wifi'], rating: 4.8, sessions: 327, responseMins: 2,
    remotePrice: 199, visitFee: 449, experienceYears: 7, area: 'Noida Sector 62',
    about: 'I fix Windows laptops and desktops — boot issues, slow performance, drivers, Wi-Fi and display problems. I explain each step so you know what changed.',
    languages: ['Hindi', 'English'], joined: 'Mar 2024',
    recentWork: ['Dell Inspiron black screen after update', 'HP Pavilion not detecting Wi-Fi', 'Custom PC random restarts'],
    reviews: [
      { id: 'r1', author: 'Ananya S.', rating: 5, text: 'Sorted my Wi-Fi driver in ten minutes and showed me how to avoid it next time.', date: '2 days ago', tags: ['Fast', 'Explained clearly'] },
      { id: 'r2', author: 'Vikram M.', rating: 5, text: 'Patient and polite. Laptop is running much faster now.', date: '1 week ago', tags: ['Helpful', 'Professional'] },
      { id: 'r3', author: 'Sneha R.', rating: 4, text: 'Needed a visit in the end but he diagnosed it correctly on the call.', date: '2 weeks ago', tags: ['Solved my problem'] },
    ],
  },
  {
    id: 't-priya', name: 'Priya Singh', initials: 'PS', verification: 'verified', availability: 'available',
    skills: ['MacBook', 'iPhone', 'iPad'], categories: ['laptop', 'phone', 'tablet'], rating: 4.9, sessions: 512, responseMins: 3,
    remotePrice: 249, visitFee: 499, experienceYears: 9, area: 'Gurugram DLF Phase 3',
    about: 'Apple devices specialist. iCloud, storage, battery health, macOS updates and data transfer between devices.',
    languages: ['Hindi', 'English', 'Punjabi'], joined: 'Nov 2023',
    recentWork: ['MacBook Air stuck on Apple logo', 'iPhone storage full after backup', 'iPad not charging'],
    reviews: [
      { id: 'r4', author: 'Rohit K.', rating: 5, text: 'Recovered my photos when I thought they were gone.', date: '3 days ago', tags: ['Solved my problem'] },
      { id: 'r5', author: 'Meera J.', rating: 5, text: 'Very calm, explained everything in simple words.', date: '1 week ago', tags: ['Explained clearly'] },
    ],
  },
  {
    id: 't-arjun', name: 'Arjun Verma', initials: 'AV', verification: 'verified', availability: 'busy',
    skills: ['Wi-Fi', 'Routers', 'Smart TV'], categories: ['wifi', 'tv', 'other'], rating: 4.7, sessions: 208, responseMins: 6,
    remotePrice: 179, visitFee: 399, experienceYears: 5, area: 'Delhi Lajpat Nagar',
    about: 'Home networks and smart TVs. Router setup, dead zones, mesh systems, casting and streaming apps.',
    languages: ['Hindi', 'English'], joined: 'Jun 2024',
    recentWork: ['Mesh Wi-Fi for 3-floor house', 'Samsung TV apps not loading', 'Router password reset'],
    reviews: [
      { id: 'r6', author: 'Kavya P.', rating: 5, text: 'Finally Wi-Fi works in every room.', date: '5 days ago', tags: ['Professional'] },
    ],
  },
  {
    id: 't-neha', name: 'Neha Gupta', initials: 'NG', verification: 'verified', availability: 'available',
    skills: ['Android', 'Samsung', 'Printers'], categories: ['phone', 'printer', 'tablet'], rating: 4.6, sessions: 141, responseMins: 4,
    remotePrice: 149, visitFee: 349, experienceYears: 4, area: 'Ghaziabad Indirapuram',
    about: 'Android phones and home printers. App crashes, storage, account recovery, printer drivers and scanning.',
    languages: ['Hindi', 'English'], joined: 'Jan 2025',
    recentWork: ['Samsung Galaxy overheating', 'HP printer offline on Wi-Fi'],
    reviews: [
      { id: 'r7', author: 'Amit B.', rating: 5, text: 'Printer works from all our phones now.', date: '1 day ago', tags: ['Fast'] },
    ],
  },
  {
    id: 't-karan', name: 'Karan Mehta', initials: 'KM', verification: 'pending', availability: 'offline',
    skills: ['Gaming PC', 'Hardware'], categories: ['pc'], rating: 0, sessions: 0, responseMins: 0,
    remotePrice: 199, visitFee: 449, experienceYears: 6, area: 'Delhi Rohini',
    about: 'Custom PC builds and upgrades.', languages: ['Hindi', 'English'], joined: 'Sep 2026', recentWork: [], reviews: [],
  },
  {
    id: 't-imran', name: 'Imran Khan', initials: 'IK', verification: 'suspended', availability: 'offline',
    skills: ['TV', 'Home theatre'], categories: ['tv'], rating: 3.9, sessions: 64, responseMins: 9,
    remotePrice: 159, visitFee: 379, experienceYears: 3, area: 'Noida Sector 18',
    about: 'TV and home audio.', languages: ['Hindi'], joined: 'Feb 2025', recentWork: [], reviews: [],
  },
]

export const BOOKINGS: Booking[] = [
  { id: 'STU-48213', customer: 'Niladri Sen', technicianId: 't-rahul', technicianName: 'Rahul Kumar', category: 'laptop', device: 'Dell Inspiron 15', problem: 'Laptop not connecting to Wi-Fi', service: 'remote', date: 'Today', time: '7:30 PM', status: 'accepted', amount: 199, area: 'Noida' },
  { id: 'STU-48102', customer: 'Niladri Sen', technicianId: 't-priya', technicianName: 'Priya Singh', category: 'phone', device: 'iPhone 14', problem: 'Phone storage full, photos not backing up', service: 'remote', date: '28 Sep', time: '11:00 AM', status: 'completed', amount: 249, area: 'Noida' },
  { id: 'STU-47755', customer: 'Niladri Sen', technicianId: 't-arjun', technicianName: 'Arjun Verma', category: 'wifi', device: 'TP-Link Archer C6', problem: 'Wi-Fi drops in bedroom', service: 'visit', date: '14 Sep', time: '5:00 PM', status: 'completed', amount: 578, area: 'Noida' },
  { id: 'STU-48230', customer: 'Ananya Sharma', technicianId: 't-rahul', technicianName: 'Rahul Kumar', category: 'pc', device: 'Custom PC', problem: 'Restarts while gaming', service: 'visit', date: 'Today', time: '4:00 PM', status: 'active', amount: 449, area: 'Gurugram' },
  { id: 'STU-48228', customer: 'Vikram Malhotra', technicianId: 't-priya', technicianName: 'Priya Singh', category: 'laptop', device: 'MacBook Air M2', problem: 'Stuck on Apple logo', service: 'remote', date: 'Today', time: '3:15 PM', status: 'completed', amount: 249, area: 'Delhi' },
  { id: 'STU-48219', customer: 'Sneha Rao', technicianId: 't-neha', technicianName: 'Neha Gupta', category: 'printer', device: 'HP DeskJet 2331', problem: 'Printer shows offline', service: 'remote', date: 'Today', time: '1:40 PM', status: 'waiting', amount: 149, area: 'Ghaziabad' },
  { id: 'STU-48197', customer: 'Rohit Kapoor', technicianId: 't-arjun', technicianName: 'Arjun Verma', category: 'tv', device: 'Samsung Crystal 4K', problem: 'Apps not loading', service: 'remote', date: 'Yesterday', time: '8:10 PM', status: 'disputed', amount: 179, area: 'Delhi' },
  { id: 'STU-48160', customer: 'Meera Joshi', technicianId: 't-imran', technicianName: 'Imran Khan', category: 'tv', device: 'LG OLED C2', problem: 'No sound from soundbar', service: 'visit', date: 'Yesterday', time: '6:00 PM', status: 'refunded', amount: 379, area: 'Noida' },
  { id: 'STU-48144', customer: 'Kavya Pillai', technicianId: 't-neha', technicianName: 'Neha Gupta', category: 'phone', device: 'Samsung Galaxy S24', problem: 'Overheating while charging', service: 'remote', date: '30 Sep', time: '10:20 AM', status: 'cancelled', amount: 0, area: 'Ghaziabad' },
  { id: 'STU-48120', customer: 'Amit Bansal', technicianId: 't-rahul', technicianName: 'Rahul Kumar', category: 'laptop', device: 'HP Pavilion 14', problem: 'Very slow after Windows update', service: 'remote', date: 'Tomorrow', time: '9:00 AM', status: 'requested', amount: 199, area: 'Noida' },
]

export const DEVICES: Device[] = [
  { id: 'd1', category: 'phone', brand: 'Samsung', model: 'Galaxy S26', lastSession: null },
  { id: 'd2', category: 'laptop', brand: 'Dell', model: 'Inspiron 15 (Windows)', lastSession: 'Today' },
  { id: 'd3', category: 'pc', brand: 'Custom', model: 'Desktop PC', lastSession: '2 Aug' },
  { id: 'd4', category: 'wifi', brand: 'TP-Link', model: 'Archer C6', lastSession: '14 Sep' },
]

export const TRANSACTIONS: Transaction[] = BOOKINGS.filter((b) => b.amount > 0).map((b, i) => {
  const commission = Math.round(b.amount * PRICING.commissionRate)
  const status = b.status === 'refunded' ? 'refunded' : b.status === 'waiting' || b.status === 'requested' || b.status === 'accepted' ? 'pending' : i === 7 ? 'failed' : 'successful'
  return { id: `TXN-${90210 + i * 37}`, bookingId: b.id, customer: b.customer, technician: b.technicianName, gross: b.amount, commission, payout: b.amount - commission, status, date: b.date }
})

export const DISPUTES: Dispute[] = [
  { id: 'DSP-1042', bookingId: 'STU-48197', customer: 'Rohit Kapoor', technician: 'Arjun Verma', reason: 'Issue came back after session', amount: 179, status: 'open', created: 'Yesterday', customerEvidence: 'Apps stopped loading again 2 hours after the call. Screenshot of error attached.', technicianNotes: 'Cleared cache for 6 apps and updated firmware. Router DNS may need change; customer declined visit.' },
  { id: 'DSP-1039', bookingId: 'STU-48160', customer: 'Meera Joshi', technician: 'Imran Khan', reason: 'Technician arrived 50 min late', amount: 379, status: 'resolved', created: '29 Sep', customerEvidence: 'Visit window 6:00–6:30 PM, arrived 7:20 PM without notice.', technicianNotes: 'Traffic on DND flyway. Did not update ETA in app.' },
  { id: 'DSP-1035', bookingId: 'STU-47990', customer: 'Kunal Arora', technician: 'Neha Gupta', reason: 'Charged for visit, solved remotely', amount: 349, status: 'investigating', created: '27 Sep', customerEvidence: 'Booked a visit but the problem was fixed on a phone call before arrival.', technicianNotes: 'Customer asked me to still come and check the printer cartridge.' },
]

export const TECH_REQUESTS: TechRequest[] = [
  { id: 'REQ-7731', customer: 'Ananya S.', category: 'laptop', device: 'HP Pavilion 14', problem: 'Laptop turns on but the screen stays black. Fan is running. Happened after it shut down during an update.', service: 'remote', price: 199, estMins: 25, area: 'Noida Sector 50', photos: 2 },
  { id: 'REQ-7734', customer: 'Arjun V.', category: 'wifi', device: 'Jio Fiber router', problem: 'Wi-Fi keeps disconnecting every few minutes on all phones.', service: 'remote', price: 179, estMins: 20, area: 'Noida Sector 76', photos: 0 },
]

// Admin chart series — 14 days of bookings and revenue.
export const DAILY = [
  { d: '19 Sep', remote: 38, visit: 11, revenue: 11240, resolved: 0.81 },
  { d: '20 Sep', remote: 42, visit: 9, revenue: 11980, resolved: 0.83 },
  { d: '21 Sep', remote: 51, visit: 14, revenue: 15210, resolved: 0.8 },
  { d: '22 Sep', remote: 47, visit: 12, revenue: 13870, resolved: 0.82 },
  { d: '23 Sep', remote: 44, visit: 10, revenue: 12460, resolved: 0.84 },
  { d: '24 Sep', remote: 49, visit: 13, revenue: 14580, resolved: 0.83 },
  { d: '25 Sep', remote: 58, visit: 15, revenue: 17320, resolved: 0.85 },
  { d: '26 Sep', remote: 61, visit: 16, revenue: 18210, resolved: 0.84 },
  { d: '27 Sep', remote: 55, visit: 12, revenue: 15890, resolved: 0.86 },
  { d: '28 Sep', remote: 63, visit: 17, revenue: 19020, resolved: 0.85 },
  { d: '29 Sep', remote: 66, visit: 14, revenue: 18650, resolved: 0.87 },
  { d: '30 Sep', remote: 70, visit: 18, revenue: 21140, resolved: 0.86 },
  { d: '1 Oct', remote: 74, visit: 16, revenue: 21480, resolved: 0.88 },
  { d: '2 Oct', remote: 52, visit: 11, revenue: 15030, resolved: 0.87 },
]

export const ACTIVITY = [
  { kind: 'approved', text: 'Neha Gupta was approved as a technician', time: '4 min ago' },
  { kind: 'booking', text: 'Booking STU-48230 created — Custom PC, visit in Gurugram', time: '11 min ago' },
  { kind: 'payment', text: 'Payment of ₹249 received for STU-48228', time: '26 min ago' },
  { kind: 'dispute', text: 'Dispute DSP-1042 opened by Rohit Kapoor', time: '1 hr ago' },
  { kind: 'booking', text: 'Booking STU-48219 created — HP printer, remote', time: '1 hr ago' },
  { kind: 'payment', text: 'Payout of ₹6,420 sent to Priya Singh', time: '3 hr ago' },
]

export const CUSTOMERS = [
  { id: 'C-2201', name: 'Niladri Sen', city: 'Noida', bookings: 3, spent: 1026, joined: 'Aug 2026' },
  { id: 'C-2188', name: 'Ananya Sharma', city: 'Gurugram', bookings: 5, spent: 1641, joined: 'Jun 2026' },
  { id: 'C-2175', name: 'Vikram Malhotra', city: 'Delhi', bookings: 2, spent: 498, joined: 'Jul 2026' },
  { id: 'C-2160', name: 'Sneha Rao', city: 'Ghaziabad', bookings: 4, spent: 925, joined: 'May 2026' },
  { id: 'C-2142', name: 'Rohit Kapoor', city: 'Delhi', bookings: 1, spent: 179, joined: 'Sep 2026' },
  { id: 'C-2131', name: 'Meera Joshi', city: 'Noida', bookings: 2, spent: 628, joined: 'Apr 2026' },
]
