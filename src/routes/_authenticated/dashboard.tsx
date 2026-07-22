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
} from "@/lib/fleet-queries";
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
    const monthlySpend = expenses
      .filter((e: any) => e.expense_date && new Date(e.expense_date).getMonth() === now.getMonth())
      .reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0);
    return { total: assets.length, active, inService, outOfService, activeAssignments, openDamage, upcomingDocs, monthlySpend };
  }, [assets, assignments, damage, docs, expenses]);

  const todaysTasks = useMemo(() => {
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 86400000);
    const tasks: { text: string; severity: "danger" | "warning" | "info" }[] = [];
    for (const m of maintenance) {
      if (m.status === "completed" || !m.scheduled_date) continue;
      const dt = new Date(m.scheduled_date);
      if (dt < now) tasks.push({ text: `Overdue: ${(m as any).type ?? "service"} on ${m.asset?.name ?? "vehicle"}`, severity: "danger" });
      else if (dt <= in7) tasks.push({ text: `Upcoming service: ${m.asset?.name ?? "vehicle"} on ${m.scheduled_date}`, severity: "warning" });
    }
    for (const d of docs) {
      if (!d.expiry_date) continue;
      const dt = new Date(d.expiry_date);
      if (dt < now) tasks.push({ text: `Expired: ${d.name ?? d.kind} on ${d.asset?.name ?? d.driver?.full_name ?? "record"}`, severity: "danger" });
      else if (dt <= in7) tasks.push({ text: `Expiring soon: ${d.name ?? d.kind} (${d.expiry_date})`, severity: "warning" });
    }
    return tasks.slice(0, 6);
  }, [maintenance, docs]);

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
