import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck, Wrench, AlertTriangle, ShieldAlert, CalendarDays, Receipt,
  Activity, ClipboardCheck, ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageBody, PageHeader } from "@/components/page-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  useAssets, useMaintenance, useAssignments, useDamageReports, useDocuments, useExpenses,
  useDrivers, useFuelLogs,
} from "@/lib/fleet-queries";
import { buildExpirations, eur, monthlySpend as monthlySpendSeries } from "@/lib/fleet-analytics";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FleetFlow" },
      { name: "description", content: "Fleet KPIs, expenses, upcoming expirations and today's tasks." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: assets = [] } = useAssets();
  const { data: maintenance = [] } = useMaintenance();
  const { data: assignments = [] } = useAssignments();
  const { data: damage = [] } = useDamageReports();
  const { data: docs = [] } = useDocuments();
  const { data: expenses = [] } = useExpenses();
  const { data: drivers = [] } = useDrivers();
  const { data: fuelLogs = [] } = useFuelLogs();

  const kpis = useMemo(() => {
    const active = assets.filter((a: any) => a.status === "active").length;
    const inService = assets.filter((a: any) => a.status === "in_maintenance").length;
    const outOfService = assets.filter((a: any) => a.status === "out_of_service").length;
    const activeAssignments = assignments.filter((a: any) => a.status === "active").length;
    const openDamage = damage.filter((d: any) => d.status === "open").length;
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 86400000);
    const upcomingDocs = docs.filter((d: any) => {
      if (!d.expiry_date) return false;
      const dt = new Date(d.expiry_date);
      return dt >= now && dt <= in30;
    }).length;
    const sameMonth = (raw: string | null | undefined) => {
      if (!raw) return false;
      const d = new Date(raw);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };
    const monthlySpend =
      expenses.filter((e: any) => sameMonth(e.expense_date)).reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0) +
      fuelLogs.filter((l: any) => sameMonth(l.logged_at)).reduce((s: number, l: any) => s + Number(l.cost ?? 0), 0) +
      maintenance.filter((m: any) => sameMonth(m.completed_date ?? m.scheduled_date)).reduce((s: number, m: any) => s + Number(m.cost ?? 0), 0);
    return { total: assets.length, active, inService, outOfService, activeAssignments, openDamage, upcomingDocs, monthlySpend };
  }, [assets, assignments, damage, docs, expenses, fuelLogs, maintenance]);

  const trend = useMemo(
    () => monthlySpendSeries(fuelLogs, maintenance, expenses, 6),
    [fuelLogs, maintenance, expenses],
  );

  const todaysTasks = useMemo(() => {
    const items = buildExpirations(docs, drivers, maintenance, 7);
    return items.slice(0, 6).map((i) => ({
      text:
        i.days < 0
          ? `Overdue: ${i.label} — ${i.target} (${Math.abs(i.days)}d late)`
          : i.days === 0
            ? `Due today: ${i.label} — ${i.target}`
            : `In ${i.days}d: ${i.label} — ${i.target}`,
      severity: (i.days < 0 ? "danger" : i.days <= 3 ? "warning" : "info") as "danger" | "warning" | "info",
    }));
  }, [maintenance, docs, drivers]);

  const displayName = (user?.user_metadata as { full_name?: string } | undefined)?.full_name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <>
      <PageHeader
        title={`Welcome, ${displayName}`}
        subtitle="Here's what's happening across your fleet today."
        actions={
          <>
            <Button variant="outline" size="sm">Export</Button>
            <Link to="/assignments"><Button size="sm">New assignment</Button></Link>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
          <KpiCard label="Total assets" value={kpis.total} icon={Truck} />
          <KpiCard label="Active" value={kpis.active} icon={Activity} tone="success" />
          <KpiCard label="In service" value={kpis.inService} icon={Wrench} tone="warning" />
          <KpiCard label="Out of service" value={kpis.outOfService} icon={ShieldAlert} tone="danger" />
          <KpiCard label="Assignments" value={kpis.activeAssignments} icon={ClipboardCheck} />
          <KpiCard label="Open damages" value={kpis.openDamage} icon={AlertTriangle} tone="danger" />
          <KpiCard label="Docs expiring" value={kpis.upcomingDocs} icon={CalendarDays} tone="warning" hint="≤ 30d" />
          <KpiCard label="Monthly spend" value={`€${kpis.monthlySpend.toFixed(0)}`} icon={Receipt} />
        </div>

        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Spend trend</h3>
              <p className="text-xs text-muted-foreground">Fuel, service and other costs · last 6 months</p>
            </div>
            <Link to="/reports" className="text-xs text-primary hover:underline">Full reports</Link>
          </div>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="dash-total" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary, 217 91% 60%))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary, 217 91% 60%))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border, 0 0% 90%))" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={48} />
                <Tooltip formatter={(v: any) => eur(Number(v))} />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary, 217 91% 60%))" strokeWidth={2} fill="url(#dash-total)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <TodaysTasks tasks={todaysTasks} />
          <RecentActivityCard assets={assets} assignments={assignments} />
        </div>

      </PageBody>
    </>
  );
}

function TodaysTasks({ tasks }: { tasks: { text: string; severity: "danger" | "warning" | "info" }[] }) {
  const severityStyles = {
    danger: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning-foreground border-warning/30",
    info: "bg-info/10 text-info border-info/20",
  } as const;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Today's tasks</h3>
          <p className="text-xs text-muted-foreground">Overdue services and expiring documents</p>
        </div>
        <Badge variant="secondary" className="rounded-full">{tasks.length}</Badge>
      </div>
      {tasks.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground text-center">All caught up. Nothing urgent right now.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {tasks.map((t, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-sm ${severityStyles[t.severity]}`}
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="leading-snug">{t.text}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RecentActivityCard({ assets, assignments }: { assets: any[]; assignments: any[] }) {
  const items = [
    ...assets.slice(0, 3).map((a) => ({ text: `Vehicle added: ${a.name}`, time: a.created_at })),
    ...assignments.slice(0, 3).map((a) => ({ text: `Assignment: ${a.asset?.name ?? "vehicle"} → ${a.driver?.full_name ?? "driver"}`, time: a.created_at })),
  ]
    .filter((i) => i.time)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Recent activity</h3>
        <Link to="/assets" className="text-xs text-primary hover:underline">All assets</Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground text-center">No activity yet. Add a vehicle or driver to get started.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((a, i) => (
            <li key={i} className="flex gap-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{a.text}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.time).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button variant="ghost" size="sm" className="mt-2 w-full justify-center gap-1 text-xs">
        View all activity <ArrowRight className="h-3 w-3" />
      </Button>
    </Card>
  );
}
