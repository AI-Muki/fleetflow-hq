import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck, Wrench, AlertTriangle, ShieldAlert, CalendarDays, Fuel, Receipt,
  Activity, Users, ClipboardCheck, TrendingUp, ArrowRight,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { PageBody, PageHeader } from "@/components/page-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  kpis, monthlyExpenses, expensesByCategory, fuelConsumption, utilization,
  todaysTasks, recentActivity, upcomingAlerts,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FleetFlow" },
      { name: "description", content: "Fleet KPIs, expenses, upcoming expirations and today's tasks." },
    ],
  }),
  component: Dashboard,
});

const chartColors = ["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-3)","var(--color-chart-4)","var(--color-chart-5)","var(--color-primary)"];

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Good morning, Ana"
        subtitle="Here's what's happening across your fleet today."
        actions={
          <>
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">New assignment</Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
          <KpiCard label="Total assets" value={kpis.totalAssets} icon={Truck} delta={{ value: "+3 this month", positive: true }} />
          <KpiCard label="Active" value={kpis.active} icon={Activity} tone="success" hint="in use" />
          <KpiCard label="In service" value={kpis.inService} icon={Wrench} tone="warning" hint="maintenance" />
          <KpiCard label="Out of service" value={kpis.outOfService} icon={ShieldAlert} tone="danger" hint="unavailable" />
          <KpiCard label="Fleet health" value={`${kpis.healthScore}%`} icon={TrendingUp} tone="success" delta={{ value: "+2", positive: true }} />
          <KpiCard label="Open damages" value={kpis.openDamage} icon={AlertTriangle} tone="danger" />
          <KpiCard label="Assigned today" value={kpis.assignedToday} icon={ClipboardCheck} />
          <KpiCard label="Upcoming reg." value={kpis.upcomingReg} icon={CalendarDays} tone="warning" hint="≤ 30d" />
          <KpiCard label="Insurance exp." value={kpis.upcomingInsurance} icon={ShieldAlert} tone="warning" hint="≤ 30d" />
          <KpiCard label="Inspections" value={kpis.upcomingInspections} icon={ClipboardCheck} hint="this month" />
          <KpiCard label="Monthly expenses" value={`€${kpis.monthlyExpenses.toLocaleString()}`} icon={Receipt} delta={{ value: "-4.2%", positive: true }} />
          <KpiCard label="Yearly expenses" value={`€${(kpis.yearlyExpenses/1000).toFixed(0)}k`} icon={Fuel} hint="YTD" />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <TodaysTasks />
          <UpcomingAlertsCard />
          <RecentActivityCard />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-5">
            <ChartHeader title="Monthly expenses" subtitle="Fuel, maintenance, insurance, other · past 12 months" />
            <div className="h-72 mt-3">
              <ResponsiveContainer>
                <AreaChart data={monthlyExpenses}>
                  <defs>
                    <linearGradient id="fuel" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v)=>`€${(v/1000).toFixed(0)}k`}/>
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="fuel" stackId="1" stroke="var(--color-primary)" fill="url(#fuel)" strokeWidth={2} />
                  <Area type="monotone" dataKey="maintenance" stackId="1" stroke="var(--color-chart-3)" fill="var(--color-chart-3)" fillOpacity={0.25} strokeWidth={2} />
                  <Area type="monotone" dataKey="insurance" stackId="1" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="other" stackId="1" stroke="var(--color-chart-4)" fill="var(--color-chart-4)" fillOpacity={0.2} strokeWidth={2} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <ChartHeader title="Expenses by category" subtitle="Year to date" />
            <div className="h-72 mt-3">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={expensesByCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {expensesByCategory.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `€${v.toLocaleString()}`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <Card className="p-5">
            <ChartHeader title="Fuel consumption" subtitle="Liters & avg. L/100km" />
            <div className="h-64 mt-3">
              <ResponsiveContainer>
                <LineChart data={fuelConsumption}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="l" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="r" orientation="right" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Line yAxisId="l" type="monotone" dataKey="liters" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="r" type="monotone" dataKey="avgConsumption" stroke="var(--color-chart-3)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5">
            <ChartHeader title="Vehicle utilization" subtitle="Avg. active hours / week" />
            <div className="h-64 mt-3">
              <ResponsiveContainer>
                <BarChart data={utilization}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="hours" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

function ChartHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function TodaysTasks() {
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
          <p className="text-xs text-muted-foreground">Things that need attention right now</p>
        </div>
        <Badge variant="secondary" className="rounded-full">{todaysTasks.length}</Badge>
      </div>
      <ul className="mt-4 space-y-2">
        {todaysTasks.map((t, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-sm ${severityStyles[t.severity as keyof typeof severityStyles]}`}
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="leading-snug">{t.text}</span>
          </motion.li>
        ))}
      </ul>
    </Card>
  );
}

function UpcomingAlertsCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Upcoming alerts</h3>
          <p className="text-xs text-muted-foreground">Next 30 days</p>
        </div>
        <Link to="/calendar" className="text-xs text-primary hover:underline">View calendar</Link>
      </div>
      <ul className="mt-4 divide-y">
        {upcomingAlerts.map((a, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm truncate">{a.target}</p>
              <p className="text-xs text-muted-foreground">{a.type}</p>
            </div>
            <Badge variant="outline" className="shrink-0 tabular-nums">{a.when}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function RecentActivityCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Recent activity</h3>
          <p className="text-xs text-muted-foreground">Team & system events</p>
        </div>
        <Users className="h-4 w-4 text-muted-foreground" />
      </div>
      <ul className="mt-4 space-y-3">
        {recentActivity.map((a, i) => (
          <li key={i} className="flex gap-3">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0">
              <p className="text-sm">
                <span className="font-medium">{a.who}</span>{" "}
                <span className="text-muted-foreground">{a.what}</span>{" "}
                <span>{a.target}</span>
              </p>
              <p className="text-xs text-muted-foreground">{a.time}</p>
            </div>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="mt-2 w-full justify-center gap-1 text-xs">
        View all activity <ArrowRight className="h-3 w-3" />
      </Button>
    </Card>
  );
}
