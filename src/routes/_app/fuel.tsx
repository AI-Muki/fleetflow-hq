import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { Fuel, Plus, TrendingDown, DollarSign, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fuelConsumption } from "@/lib/mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_app/fuel")({
  head: () => ({ meta: [{ title: "Fuel — FleetFlow" }] }),
  component: FuelPage,
});

const logs = [
  { date: "2026-07-21", driver: "Ahmed Karim", vehicle: "BE-142-AC", km: 128420, liters: 62, cost: 106.40, station: "Shell Airport" },
  { date: "2026-07-20", driver: "John Peters", vehicle: "GR-108-BM", km: 402180, liters: 210, cost: 358.20, station: "OMV A2" },
  { date: "2026-07-19", driver: "Michael Novak", vehicle: "FL-129-CP", km: 87910, liters: 48, cost: 82.10, station: "INA Zagreb" },
  { date: "2026-07-19", driver: "Marko Jović", vehicle: "ZG-131-EM", km: 215600, liters: 180, cost: 306.00, station: "Petrol Ljubljana" },
];

function FuelPage() {
  return (
    <>
      <PageHeader title="Fuel management" subtitle="Consumption, cost per kilometer, and monthly trends."
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4"/>Log fuel</Button>} />
      <PageBody>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-4">
          <KpiCard label="Avg. consumption" value="8.6 L/100km" icon={Gauge} delta={{value:"-0.3", positive:true}} />
          <KpiCard label="Cost / km" value="€0.14" icon={DollarSign} delta={{value:"-2%", positive:true}} />
          <KpiCard label="Monthly fuel cost" value="€11,100" icon={Fuel} />
          <KpiCard label="YTD savings" value="€3,240" icon={TrendingDown} tone="success" />
        </div>
        <Card className="p-5 mb-4">
          <h3 className="text-sm font-semibold">Consumption trend</h3>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <AreaChart data={fuelConsumption}>
                <defs><linearGradient id="fg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35}/><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" fontSize={11} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background:"var(--color-popover)", border:"1px solid var(--color-border)", borderRadius:8, fontSize:12 }} />
                <Area type="monotone" dataKey="liters" stroke="var(--color-primary)" strokeWidth={2} fill="url(#fg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Driver</th>
                <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                <th className="text-right px-4 py-3 font-medium">Odometer</th>
                <th className="text-right px-4 py-3 font-medium">Liters</th>
                <th className="text-right px-4 py-3 font-medium">Cost</th>
                <th className="text-left px-4 py-3 font-medium">Station</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l,i)=>(
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 tabular-nums">{l.date}</td>
                  <td className="px-4 py-3">{l.driver}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.vehicle}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{l.km.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-right tabular-nums">{l.liters}</td>
                  <td className="px-4 py-3 text-right tabular-nums">€{l.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.station}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </PageBody>
    </>
  );
}
