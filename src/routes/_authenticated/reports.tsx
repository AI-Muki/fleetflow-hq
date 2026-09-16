import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { BarChart3, Download, Fuel, Receipt, Wrench, TrendingUp } from "lucide-react";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useAssets, useDocuments, useDrivers, useExpenses, useFuelLogs, useMaintenance,
} from "@/lib/fleet-queries";
import {
  buildExpirations, consumptionByAsset, costByAsset, costByCategory, downloadCSV, eur,
  monthlySpend, round2,
} from "@/lib/fleet-analytics";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports & analytics — FleetFlow" },
      { name: "description", content: "Fleet cost trends, fuel consumption, cost per kilometre and CSV exports." },
      { property: "og:title", content: "FleetFlow reports & analytics" },
      { property: "og:description", content: "Monthly spend, cost per vehicle, consumption and exportable reports." },
    ],
  }),
  component: ReportsPage,
});

const CHART_COLORS = [
  "hsl(var(--chart-1, 217 91% 60%))",
  "hsl(var(--chart-2, 160 60% 45%))",
  "hsl(var(--chart-3, 38 92% 50%))",
  "hsl(var(--chart-4, 0 72% 55%))",
  "hsl(var(--chart-5, 262 83% 63%))",
  "hsl(var(--chart-6, 199 89% 48%))",
];

const tooltipStyle = {
  background: "hsl(var(--popover, 0 0% 100%))",
  border: "1px solid hsl(var(--border, 0 0% 90%))",
  borderRadius: 10,
  fontSize: 12,
  color: "hsl(var(--popover-foreground, 0 0% 10%))",
};

function ReportsPage() {
  const { data: assets = [] } = useAssets();
  const { data: drivers = [] } = useDrivers();
  const { data: fuelLogs = [] } = useFuelLogs();
  const { data: maintenance = [] } = useMaintenance();
  const { data: expenses = [] } = useExpenses();
  const { data: docs = [] } = useDocuments();
  const [months, setMonths] = useState("6");

  const trend = useMemo(
    () => monthlySpend(fuelLogs, maintenance, expenses, Number(months)),
    [fuelLogs, maintenance, expenses, months],
  );
  const categories = useMemo(
    () => costByCategory(fuelLogs, maintenance, expenses),
    [fuelLogs, maintenance, expenses],
  );
  const perAsset = useMemo(
    () => costByAsset(assets, fuelLogs, maintenance, expenses),
    [assets, fuelLogs, maintenance, expenses],
  );
  const consumption = useMemo(() => consumptionByAsset(fuelLogs), [fuelLogs]);
  const expirations = useMemo(() => buildExpirations(docs, drivers, maintenance, 90), [docs, drivers, maintenance]);

  const totalSpend = categories.reduce((s, c) => s + c.value, 0);
  const fuelSpend = fuelLogs.reduce((s: number, l: any) => s + Number(l.cost ?? 0), 0);
  const serviceSpend = maintenance.reduce((s: number, m: any) => s + Number(m.cost ?? 0), 0);
  const trackedKm = consumption.reduce((s, c) => s + c.km, 0);
  const avgCostPerKm = trackedKm > 0
    ? consumption.reduce((s, c) => s + c.cost, 0) / trackedKm
    : null;

  const hasData = totalSpend > 0 || consumption.length > 0;

  const exports = [
    {
      name: "Fleet cost report",
      icon: BarChart3,
      desc: "Total spend per vehicle, split by fuel, service and other costs.",
      file: "fleet-cost-report",
      rows: () => perAsset.map((r) => ({
        vehicle: r.name, fuel_eur: r.fuel, service_eur: r.service, other_eur: r.other, total_eur: r.total,
      })),
    },
    {
      name: "Fuel & consumption",
      icon: Fuel,
      desc: "Litres, €/L, l/100 km and cost per kilometre by vehicle.",
      file: "fuel-consumption",
      rows: () => consumption.map((c) => ({
        vehicle: c.name, plate: c.plate ?? "", fills: c.fills, liters: round2(c.liters),
        cost_eur: round2(c.cost), km: c.km,
        l_per_100km: c.litersPer100 ? round2(c.litersPer100) : "",
        eur_per_km: c.costPerKm ? round2(c.costPerKm) : "",
      })),
    },
    {
      name: "Maintenance report",
      icon: Wrench,
      desc: "Every service job with status, dates, vendor and cost.",
      file: "maintenance-report",
      rows: () => maintenance.map((m: any) => ({
        vehicle: m.asset?.name ?? "", plate: m.asset?.plate ?? "", type: m.type, status: m.status,
        scheduled: m.scheduled_date ?? "", completed: m.completed_date ?? "",
        odometer: m.odometer ?? "", vendor: m.vendor ?? "", cost_eur: m.cost ?? "",
      })),
    },
    {
      name: "Expenses report",
      icon: Receipt,
      desc: "All logged expenses by category and vehicle.",
      file: "expenses-report",
      rows: () => expenses.map((e: any) => ({
        date: e.expense_date, category: e.category, amount_eur: e.amount, description: e.description ?? "",
      })),
    },
    {
      name: "Upcoming expirations",
      icon: TrendingUp,
      desc: "Registrations, insurance, inspections and licences due in 90 days.",
      file: "expirations",
      rows: () => expirations.map((e) => ({
        item: e.label, kind: e.kind, target: e.target, due: e.date, days_left: e.days, status: e.severity,
      })),
    },
    {
      name: "Driver report",
      icon: BarChart3,
      desc: "Driver roster with licence validity and contact details.",
      file: "driver-report",
      rows: () => drivers.map((d: any) => ({
        name: d.full_name, email: d.email ?? "", phone: d.phone ?? "",
        license: d.license_number ?? "", license_expiry: d.license_expiry ?? "", status: d.status ?? "",
      })),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reports & analytics"
        subtitle="Cost trends, consumption and exportable operational reports."
        actions={
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <PageBody>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Stat label="Total spend" value={eur(totalSpend)} />
          <Stat label="Fuel spend" value={eur(fuelSpend)} />
          <Stat label="Service spend" value={eur(serviceSpend)} />
          <Stat label="Avg. cost / km" value={avgCostPerKm ? `€${avgCostPerKm.toFixed(2)}` : "—"} />
        </div>

        {!hasData && (
          <Card className="mt-4 p-10 text-center text-muted-foreground">
            <BarChart3 className="mx-auto mb-3 h-8 w-8" />
            No data to report yet. Log fuel, service or expenses and the charts fill in automatically.
          </Card>
        )}

        {hasData && (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold">Monthly spend</h3>
              <p className="text-xs text-muted-foreground">Fuel, service and other costs per month.</p>
              <div className="mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <defs>
                      {["fuel", "service", "other"].map((k, i) => (
                        <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS[i]} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={CHART_COLORS[i]} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border, 0 0% 90%))" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} width={48} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => eur(Number(v))} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="fuel" stroke={CHART_COLORS[0]} fill="url(#g-fuel)" strokeWidth={2} />
                    <Area type="monotone" dataKey="service" stroke={CHART_COLORS[1]} fill="url(#g-service)" strokeWidth={2} />
                    <Area type="monotone" dataKey="other" stroke={CHART_COLORS[2]} fill="url(#g-other)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold">Cost breakdown</h3>
              <p className="text-xs text-muted-foreground">Share of total spend by category.</p>
              <div className="mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {categories.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => eur(Number(v))} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5 lg:col-span-3">
              <h3 className="text-sm font-semibold">Cost per vehicle</h3>
              <p className="text-xs text-muted-foreground">Top spenders in the fleet.</p>
              <div className="mt-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perAsset.slice(0, 12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border, 0 0% 90%))" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} width={48} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => eur(Number(v))} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="fuel" stackId="a" fill={CHART_COLORS[0]} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="service" stackId="a" fill={CHART_COLORS[1]} />
                    <Bar dataKey="other" stackId="a" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        <h2 className="mt-8 text-sm font-semibold">Export reports</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {exports.map((r) => {
            const rows = r.rows();
            return (
              <Card key={r.name} className="p-5 transition-shadow hover:shadow-md">
                <r.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold">{r.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{rows.length} rows</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={rows.length === 0}
                    onClick={() => downloadCSV(r.file, rows)}
                  >
                    <Download className="h-4 w-4" />CSV
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </PageBody>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </Card>
  );
}
