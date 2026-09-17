# FleetFlow

**Enterprise fleet, asset and driver management.** Track vehicles, drivers, handovers, maintenance, fuel, expenses and document expirations in one place — with live KPIs, charts and CSV exports.

## Features

- **Multi-company workspaces** — each user can belong to several companies with a role: owner, admin, manager, mechanic, driver or accountant.
- **Dashboard** — fleet KPIs, six-month spend trend, recent activity and a *Today's tasks* list of overdue services and expiring documents.
- **Assets** — vehicles with plate, VIN, make/model, odometer, fuel type, status and a per-vehicle detail view.
- **Drivers** — contact details, licence number and expiry, status.
- **Assignments** — handover and return flow with odometer readings, condition notes and photo/signature storage.
- **Maintenance** — scheduled and logged services with cost, vendor, odometer and status.
- **Fuel** — fill-up log plus derived consumption per vehicle (L/100 km, €/km, €/L).
- **Expenses & damage reports** — categorised costs and severity-rated damage records.
- **Documents** — registration, insurance, inspection and licence files in private storage, with expiry tracking.
- **Calendar** — every expiry and scheduled service on a month grid.
- **Reports** — monthly spend area chart, cost breakdown pie, per-vehicle stacked bars and six CSV exports.

## Tech stack

TanStack Start (React 19 + TanStack Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Recharts · Framer Motion · Lucide · Lovable Cloud (Postgres, auth, storage) with row-level security on every table.

## Development

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

The app runs on `http://localhost:8080`.

## Project layout

```
src/routes/                  file-based routes (_authenticated/* is the signed-in app)
src/components/              shell, dialogs, form kit, UI primitives
src/lib/fleet-queries.ts     data hooks (read + mutations)
src/lib/fleet-analytics.ts   expirations, consumption, cost analytics, CSV
src/hooks/                   auth, active company, theme
```

## Built with Lovable

Open the project in [Lovable](https://lovable.dev) and keep building — changes sync straight to this repository.
