import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Fuel, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFuelLogs } from "@/lib/fleet-queries";

export const Route = createFileRoute("/_authenticated/fuel")({
  head: () => ({ meta: [{ title: "Fuel — FleetFlow" }] }),
  component: FuelPage,
});

function FuelPage() {
  const { data: logs = [], isLoading } = useFuelLogs();
  const totalCost = logs.reduce((s: number, l: any) => s + Number(l.total_cost ?? 0), 0);
  const totalLiters = logs.reduce((s: number, l: any) => s + Number(l.liters ?? 0), 0);
  return (
    <>
      <PageHeader
        title="Fuel management"
        subtitle="Consumption, cost per kilometer, and monthly trends."
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Log fuel</Button>}
      />
      <PageBody>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-4">
          <Card className="p-4"><div className="text-xs text-muted-foreground">Entries</div><div className="mt-1 text-2xl font-semibold tabular-nums">{logs.length}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">Total liters</div><div className="mt-1 text-2xl font-semibold tabular-nums">{totalLiters.toFixed(0)}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">Total cost</div><div className="mt-1 text-2xl font-semibold tabular-nums">€{totalCost.toFixed(0)}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">Avg. €/L</div><div className="mt-1 text-2xl font-semibold tabular-nums">{totalLiters ? `€${(totalCost / totalLiters).toFixed(2)}` : "—"}</div></Card>
        </div>
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground"><Loader2 className="h-4 w-4 inline animate-spin mr-2" />Loading…</div>
        ) : logs.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            <Fuel className="mx-auto h-8 w-8 mb-3" />
            No fuel logs yet. Log a fill-up to start tracking consumption.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                  <th className="text-right px-4 py-3 font-medium">Odometer</th>
                  <th className="text-right px-4 py-3 font-medium">Liters</th>
                  <th className="text-right px-4 py-3 font-medium">Cost</th>
                  <th className="text-left px-4 py-3 font-medium">Station</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l: any) => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 tabular-nums">{l.logged_at ? new Date(l.logged_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">{l.asset?.name} · {l.asset?.plate}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{(l.odometer ?? 0).toLocaleString()} km</td>
                    <td className="px-4 py-3 text-right tabular-nums">{l.liters ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{l.total_cost ? `€${Number(l.total_cost).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.station ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </PageBody>
    </>
  );
}
