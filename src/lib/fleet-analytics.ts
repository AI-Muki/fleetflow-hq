/**
 * Derived fleet metrics: expirations, fuel consumption, cost analytics, CSV export.
 * Pure functions over the rows returned by the fleet queries.
 */

export type Severity = "expired" | "critical" | "soon" | "ok";

export type ExpiryItem = {
  id: string;
  label: string;
  kind: string;
  target: string;
  date: string;
  days: number;
  severity: Severity;
};

export const DAY = 86_400_000;

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / DAY);
}

export function severityFor(days: number): Severity {
  if (days < 0) return "expired";
  if (days <= 7) return "critical";
  if (days <= 30) return "soon";
  return "ok";
}

/** Documents + driver licenses + scheduled services, merged and sorted by urgency. */
export function buildExpirations(
  docs: any[],
  drivers: any[],
  maintenance: any[],
  horizonDays = 60,
): ExpiryItem[] {
  const items: ExpiryItem[] = [];

  for (const d of docs) {
    const days = daysUntil(d.expiry_date);
    if (days === null || days > horizonDays) continue;
    items.push({
      id: `doc-${d.id}`,
      label: d.name ?? d.kind,
      kind: d.kind ?? "document",
      target: d.asset ? `${d.asset.name}${d.asset.plate ? ` · ${d.asset.plate}` : ""}` : d.driver?.full_name ?? "—",
      date: d.expiry_date,
      days,
      severity: severityFor(days),
    });
  }

  for (const dr of drivers) {
    const days = daysUntil(dr.license_expiry);
    if (days === null || days > horizonDays) continue;
    items.push({
      id: `lic-${dr.id}`,
      label: "Driving licence",
      kind: "license",
      target: dr.full_name,
      date: dr.license_expiry,
      days,
      severity: severityFor(days),
    });
  }

  for (const m of maintenance) {
    if (m.status === "completed" || m.status === "cancelled") continue;
    const days = daysUntil(m.scheduled_date);
    if (days === null || days > horizonDays) continue;
    items.push({
      id: `svc-${m.id}`,
      label: `${m.type ?? "service"} service`,
      kind: "service",
      target: m.asset ? `${m.asset.name}${m.asset.plate ? ` · ${m.asset.plate}` : ""}` : "—",
      date: m.scheduled_date,
      days,
      severity: severityFor(days),
    });
  }

  return items.sort((a, b) => a.days - b.days);
}

/* ---------------- Fuel consumption ---------------- */

export type AssetConsumption = {
  assetId: string;
  name: string;
  plate: string | null;
  liters: number;
  cost: number;
  km: number;
  litersPer100: number | null;
  costPerKm: number | null;
  pricePerLiter: number | null;
  fills: number;
};

/**
 * Consumption per vehicle. Distance comes from the odometer span between the
 * first and last fill-up, so a vehicle needs at least two odometer readings.
 */
export function consumptionByAsset(fuelLogs: any[]): AssetConsumption[] {
  const groups = new Map<string, any[]>();
  for (const log of fuelLogs) {
    if (!log.asset_id) continue;
    const list = groups.get(log.asset_id) ?? [];
    list.push(log);
    groups.set(log.asset_id, list);
  }

  const rows: AssetConsumption[] = [];
  for (const [assetId, logs] of groups) {
    const sorted = [...logs].sort(
      (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
    );
    const liters = sorted.reduce((s, l) => s + Number(l.liters ?? 0), 0);
    const cost = sorted.reduce((s, l) => s + Number(l.cost ?? 0), 0);
    const odos = sorted.map((l) => Number(l.odometer)).filter((n) => Number.isFinite(n) && n > 0);
    const km = odos.length >= 2 ? Math.max(...odos) - Math.min(...odos) : 0;
    // Litres burned between the first and last reading exclude the first tank.
    const litersBetween = odos.length >= 2
      ? sorted.slice(1).reduce((s, l) => s + Number(l.liters ?? 0), 0)
      : 0;
    rows.push({
      assetId,
      name: sorted[0].asset?.name ?? "Vehicle",
      plate: sorted[0].asset?.plate ?? null,
      liters,
      cost,
      km,
      fills: sorted.length,
      litersPer100: km > 0 ? (litersBetween / km) * 100 : null,
      costPerKm: km > 0 ? cost / km : null,
      pricePerLiter: liters > 0 ? cost / liters : null,
    });
  }
  return rows.sort((a, b) => b.cost - a.cost);
}

/* ---------------- Cost analytics ---------------- */

export type MonthPoint = { month: string; fuel: number; service: number; other: number; total: number };

const MONTH_LABEL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthlySpend(
  fuelLogs: any[],
  maintenance: any[],
  expenses: any[],
  months = 6,
): MonthPoint[] {
  const now = new Date();
  const buckets: MonthPoint[] = [];
  const index = new Map<string, MonthPoint>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const point: MonthPoint = { month: MONTH_LABEL[d.getMonth()], fuel: 0, service: 0, other: 0, total: 0 };
    buckets.push(point);
    index.set(key, point);
  }

  const add = (raw: string | null | undefined, field: "fuel" | "service" | "other", amount: number) => {
    if (!raw || !amount) return;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return;
    const point = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (!point) return;
    point[field] += amount;
    point.total += amount;
  };

  fuelLogs.forEach((l) => add(l.logged_at, "fuel", Number(l.cost ?? 0)));
  maintenance.forEach((m) => add(m.completed_date ?? m.scheduled_date, "service", Number(m.cost ?? 0)));
  expenses.forEach((e) => add(e.expense_date, "other", Number(e.amount ?? 0)));

  return buckets.map((b) => ({
    ...b,
    fuel: round2(b.fuel),
    service: round2(b.service),
    other: round2(b.other),
    total: round2(b.total),
  }));
}

export function costByCategory(fuelLogs: any[], maintenance: any[], expenses: any[]) {
  const map = new Map<string, number>();
  const bump = (k: string, v: number) => { if (v) map.set(k, (map.get(k) ?? 0) + v); };
  bump("Fuel", fuelLogs.reduce((s, l) => s + Number(l.cost ?? 0), 0));
  bump("Service", maintenance.reduce((s, m) => s + Number(m.cost ?? 0), 0));
  expenses.forEach((e) => bump(titleCase(e.category ?? "other"), Number(e.amount ?? 0)));
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: round2(value) }))
    .sort((a, b) => b.value - a.value);
}

export function costByAsset(assets: any[], fuelLogs: any[], maintenance: any[], expenses: any[]) {
  const rows = assets.map((a) => {
    const fuel = fuelLogs.filter((l) => l.asset_id === a.id).reduce((s, l) => s + Number(l.cost ?? 0), 0);
    const service = maintenance.filter((m) => m.asset_id === a.id).reduce((s, m) => s + Number(m.cost ?? 0), 0);
    const other = expenses.filter((e) => e.asset_id === a.id).reduce((s, e) => s + Number(e.amount ?? 0), 0);
    return {
      id: a.id,
      name: a.plate ?? a.name,
      fuel: round2(fuel),
      service: round2(service),
      other: round2(other),
      total: round2(fuel + service + other),
    };
  });
  return rows.filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
export const eur = (n: number) =>
  `€${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/* ---------------- CSV export ---------------- */

export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  const csv = toCSV(rows);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
