import type { SVGProps } from 'react'

// Line icon set, 24px grid, 1.6 stroke.
const paths: Record<string, string> = {
  laptop: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V16H4zM2 18h20',
  pc: 'M3 4h18v12H3zM8 20h8M12 16v4',
  phone: 'M7 2.5h10a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1zM11 18.5h2',
  tablet: 'M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
  wifi: 'M2 8.8a15 15 0 0 1 20 0M5.5 12.4a10 10 0 0 1 13 0M9 15.9a5 5 0 0 1 6 0M12 19.5h.01',
  tv: 'M3 5h18v12H3zM8 21h8M12 17v4',
  printer: 'M7 8V3h10v5M6 17H4V9h16v8h-2M7 14h10v7H7z',
  other: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5',
  home: 'M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3z',
  calendar: 'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  devices: 'M3 5h13v9H3zM1 17h17M18 9h5v12h-5z',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  chevronRight: 'M9 5l7 7-7 7',
  chevronLeft: 'M15 5l-7 7 7 7',
  chevronDown: 'M5 9l7 7 7-7',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-4.5',
  mic: 'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  micOff: 'M3 3l18 18M9 9v3a3 3 0 0 0 5 2.2M15 9.5V6a3 3 0 0 0-5.9-.8M5 11a7 7 0 0 0 11.5 5.4M19 11a7 7 0 0 1-.5 2.5M12 18v3',
  video: 'M3 6h12v12H3zM15 10l6-3v10l-6-3',
  videoOff: 'M3 3l18 18M15 10l6-3v10l-6-3M15 15v3H6M3 6v12M8 6h7v5',
  speaker: 'M4 9h4l5-4v14l-5-4H4zM17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11',
  screen: 'M3 4h18v12H3zM8 20h8M12 8v5M9.5 10.5L12 8l2.5 2.5',
  chat: 'M4 5h16v11H9l-5 4z',
  phoneOff: 'M3 3l18 18M8.6 12.4a12 12 0 0 1-2.4-3.7L8 6.5 6 3H3.5A1.5 1.5 0 0 0 2 4.6 18 18 0 0 0 7 15M10.5 15.6A12 12 0 0 0 15 17.8l2-1.8 4 2v2.5A1.5 1.5 0 0 1 19.4 22 18 18 0 0 1 13 20',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  camera: 'M3 7h4l2-3h6l2 3h4v13H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  image: 'M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6M15.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  film: 'M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4',
  mapPin: 'M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  rupee: 'M6 4h12M6 8h12M14 4a4 4 0 0 1 0 8H6l8 8',
  bell: 'M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20a7 7 0 0 1 14 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 13.5a7 7 0 0 1 4 6.5',
  wrench: 'M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 1-2-2zM14.5 6.5L17 4a4 4 0 0 1 3 3l-2.5 2.5',
  card: 'M2 6h20v12H2zM2 10h20M6 15h4',
  alert: 'M12 3l10 18H2zM12 10v4M12 17.5h.01',
  message: 'M21 12a8 8 0 0 1-11.8 7L3 21l2-6.2A8 8 0 1 1 21 12z',
  percent: 'M19 5L5 19M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1.5-2-3.5-2.4.6a7 7 0 0 0-1.6-1L14.5 4h-5L9 6.6a7 7 0 0 0-1.6 1L5 7l-2 3.5L5 12l-2 1.5L5 17l2.4-.6a7 7 0 0 0 1.6 1l.5 2.6h5l.5-2.6a7 7 0 0 0 1.6-1L19 17l2-3.5z',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',
  navigation: 'M3 11l18-8-8 18-2-8z',
  note: 'M5 3h10l4 4v14H5zM9 11h6M9 15h6',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  wallet: 'M3 7h17v13H3zM3 7l13-4v4M16 13.5h.01',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4',
  menu: 'M4 6h16M4 12h16M4 18h16',
  refresh: 'M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4',
  wifiOff: 'M3 3l18 18M8.5 16a5 5 0 0 1 7 0M5 12.6a10 10 0 0 1 4-2.3M2 8.8a15 15 0 0 1 5-3M13 6a15 15 0 0 1 9 2.8M16.5 10.5a10 10 0 0 1 2.5 2M12 19.5h.01',
}

export type IconName = keyof typeof paths

export function Icon({ name, size = 20, strokeWidth = 1.6, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={paths[name]} />
    </svg>
  )
}

export function BrandMark({ size = 32 }: { size?: number }) {
  // Two spans meeting — "Setu" means bridge.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--color-primary)" />
      <path d="M7 21c0-5 4-9 9-9s9 4 9 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M7 21h18" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 12v9" stroke="#9fa6f0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
