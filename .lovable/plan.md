FleetFlow is a very large enterprise SaaS spec (auth, multi-company, assets, drivers, assignments with handover/damage, maintenance, registrations, fuel, expenses, calendar, reports, audit log, AI, notifications, QR, dark mode, etc.). Shipping all of it in one pass would produce shallow, broken features. I'll build it in focused phases, each phase working end-to-end, so you can use it as it grows.

## Phase 1 — Foundation & Shell (this turn)

- Design system: professional enterprise palette (deep navy + electric accent), dark/light mode toggle, typography, soft shadows, rounded cards, semantic tokens in `src/styles.css`.
- App shell: collapsible sidebar, top bar with global search, notifications bell, user menu, breadcrumbs, responsive (desktop/tablet/mobile).
- Routes scaffolded (all with real UI, using mock data so it looks production-ready):
  - `/` marketing landing (public) → CTA to `/auth`
  - `/auth` sign in / sign up
  - `/dashboard` KPIs, charts (Recharts), Today's Tasks, Recent Activity, Upcoming Alerts
  - `/assets`, `/assets/$id`
  - `/drivers`, `/drivers/$id`
  - `/assignments` (with handover flow UI)
  - `/maintenance`
  - `/damage-reports`
  - `/fuel`
  - `/expenses`
  - `/documents`
  - `/calendar`
  - `/reports`
  - `/settings` (company profile, users, roles)
- Framer Motion page/element transitions, loading skeletons, empty states.
- Lovable Cloud enabled; auth wired (email/password + Google); minimal schema for `companies`, `profiles`, `user_roles`, `company_members`.

## Phase 2 — Core data & CRUD
Assets, Drivers, Assignments (with handover before/after photos + digital signature), Damage Reports. Full Supabase schema, RLS scoped by `company_id`, storage buckets for photos/documents, real CRUD replacing mock data.

## Phase 3 — Operations
Maintenance (log + scheduled by mileage/hours/date), Registrations & expirations, Fuel logs with consumption calc, Expenses with breakdowns.

## Phase 4 — Intelligence & polish
Notification engine (dashboard + email), Calendar view, Reports (PDF/Excel/CSV export), Audit log, Global search, QR codes, AI document extraction + assistant (Lovable AI Gateway), Bulk import/export.

---

## Technical notes

- Stack matches template: TanStack Start (React 19, TS, Tailwind v4), TanStack Router (not React Router DOM — the spec says React Router but the template ships TanStack; same mental model, better SSR). Recharts, Framer Motion, Lucide, Supabase via Lovable Cloud.
- Multi-tenant model: every domain table has `company_id`; RLS uses a `has_company_access(company_id)` security-definer fn. Roles in a separate `user_roles` table per the roles knowledge (prevents privilege escalation).
- Soft delete: `deleted_at` column on all domain tables.
- Storage buckets: `asset-photos`, `asset-documents`, `handover-photos`, `damage-photos`, `driver-documents`, `invoices` (private, RLS by company).

## Confirm before I start Phase 1

1. **Scope of Phase 1**: ship the full UI shell + dashboards + all listed pages with realistic mock data, plus real auth & company creation. Real CRUD lands in Phase 2. OK?
2. **Router**: use TanStack Router (template default, works with the rest of the stack) instead of React Router DOM. OK?
3. **Landing page vs. straight to app**: keep a short public landing at `/` with a sign-in CTA, or redirect `/` straight to `/auth` / `/dashboard`?

Reply "go" to proceed with the defaults above (Phase 1 as scoped, TanStack Router, short public landing), or tell me what to change.