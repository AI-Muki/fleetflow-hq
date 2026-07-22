import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, Loader2 } from "lucide-react";
import { useMaintenance } from "@/lib/fleet-queries";

export const Route = createFileRoute("/_authenticated/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — FleetFlow" }] }),
  component: MaintPage,
});

function MaintPage() {
  const { data: jobs = [], isLoading } = useMaintenance();
  return (
    <>
      <PageHeader
        title="Maintenance"
        subtitle="Scheduled by mileage, engine hours or date — whichever comes first."
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Log service</Button>}
      />
      <PageBody>
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground"><Loader2 className="h-4 w-4 inline animate-spin mr-2" />Loading…</div>
        ) : jobs.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            No maintenance records yet. Log a service or schedule one for a vehicle.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Scheduled</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j: any) => (
                  <tr key={j.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/8 text-primary grid place-items-center"><Wrench className="h-4 w-4" /></div>
                        <span>{j.asset?.name} · {j.asset?.plate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{j.type ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{j.scheduled_date ?? "—"}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{j.status ?? "scheduled"}</Badge></td>
                    <td className="px-4 py-3 text-right tabular-nums">{j.cost ? `€${Number(j.cost).toLocaleString()}` : "—"}</td>
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
