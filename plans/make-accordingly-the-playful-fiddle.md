# Plan: "Setu" — Technical Support Marketplace prototype

## Context
You attached the "Tech Support Marketplace Frontend Declaration" five times, and all five are the same file. It is a product spec, not an image. It asks for three connected surfaces that share one design system: a Customer mobile app, a Technician mobile app and an Admin web dashboard, all running on a mock service layer. The project is currently an empty Vite + React 19 + Tailwind v4 scaffold (`src/App.tsx` renders a blank div), so this is a new build. I'll keep the existing entrypoint and `index.css` wiring.

## Approach
- **Aesthetic:** run the `aesthetic-stance` skill, then `create_make_theme`. The direction is a restrained, mature Indian service brand: a deep indigo primary, cool neutrals, a near-white background, and dark surfaces used only for video sessions. Font is Plus Jakarta Sans (Google CSS2 `@import` in `src/index.css`). Radii are 8/12/16 px with a 4 px spacing scale. Semantic tokens follow spec §5.1 and go in `@theme` in `src/index.css`.
- **Routing:** install `react-router` (load the `react-router` skill first) and use the route map from spec §53. `/` is a small launcher for picking Customer, Technician or Admin. Customer and Technician screens sit inside a centered mobile-width layout with bottom navigation. Admin uses a desktop layout with a sidebar and top bar that collapses on narrow screens. Heavy screens (video session, admin pages) are lazy-loaded.
- **Structure** (spec §51):
  - `src/types`: Booking, Technician and the related types, including the state unions from §45.
  - `src/services`: mock `auth`, `technician`, `booking`, `session`, `payment`, `review` and `admin` services. Each is async with a small delay, and data lives in `src/services/mock/data.ts` using the Indian names, places and devices from §50, labelled as mock data.
  - `src/state`: a small React context for the in-progress customer flow (draft problem, selected technician, booking) and for technician availability.
  - `src/components/ui`: Button (with loading and success states), Input, OtpInput, Tabs, Badge/StatusBadge, VerificationBadge, Rating, Avatar (initials, no stock photos), BottomSheet, Modal/ConfirmDialog, Toast, Stepper/Timeline, Skeleton, EmptyState, ErrorState, PaymentSummary.
  - `src/components/domain`: TechnicianCard, BookingCard, DeviceCard, ReviewCard and line icons for device categories (`lucide-react`).
  - `src/layouts`: MobileLayout and AdminLayout.
  - `src/pages/customer`, `src/pages/technician`, `src/pages/admin`.
- **Customer flow:** splash and onboarding, phone + OTP login (with error states), home, problem description, matching (stepped checklist), technician results with filters, technician profile, booking (connect now or schedule), confirmation, waiting screen, video session (dark, with controls and a timer), resolution (fixed or not fixed), in-person visit, arrival timeline, payment (UPI/card, with a simulated failure option), review, bookings tabs, devices and profile. Also covers the "no technicians available" and "session disconnected" states.
- **Technician flow:** an obvious Available/Offline toggle, home with today's earnings, request card with accept/decline and a gentle countdown, pre-session and in-session screens (notes, mark resolved, escalate, end), bookings with a navigation CTA, earnings (gross, deductions and net per period, plus transactions), profile, and an onboarding stepper that ends at "Pending verification".
- **Admin:** dashboard with KPIs and four business-question charts built with `recharts`, following the `dataviz` skill, plus an activity feed. Tables for technicians (filters, plus approve/suspend/reject behind confirmation dialogs), technician detail, bookings (with a detail drawer), payments (status filters), disputes (detail view with refund, partial refund, credit and close), and simple customers, sessions, reviews and settings tables.
- Every button navigates, changes state or shows a toast saying the feature isn't available. No lorem ipsum.

## Verification
Run one `pnpm build` (tsc + vite) at the end and fix any errors. Then walk the three required flows in the preview.
