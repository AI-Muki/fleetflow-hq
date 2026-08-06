import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useDamageReports } from "@/lib/fleet-queries";
import { NewDamageDialog } from "@/components/fleet-dialogs";

export const Route = createFileRoute("/_authenticated/damage-reports")({
  head: () => ({ meta: [{ title: "Damage reports — FleetFlow" }] }),
  component: DamagePage,
});

function DamagePage() {
  const { data: reports = [], isLoading } = useDamageReports();
  const open = reports.filter((d: any) => d.status === "open").length;

  return (
    <>
      <PageHeader
        title="Damage reports"
        subtitle={`${reports.length} reports · ${open} open`}
        actions={<NewDamageDialog />}
      />
      <PageBody>
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground"><Loader2 className="h-4 w-4 inline animate-spin mr-2" />Loading…</div>
        ) : reports.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            <AlertTriangle className="mx-auto h-8 w-8 mb-3" />
            No damage reports. New reports appear here once filed.
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((d: any) => (
              <Card key={d.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive grid place-items-center">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-xs">{d.id.slice(0, 8)}</span>
                  </div>
                  <Badge variant="outline">{d.status ?? "open"}</Badge>
                </div>
                <h3 className="mt-4 text-sm font-semibold">{d.asset?.name} · {d.asset?.plate}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{d.description ?? "—"}</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div><div className="text-muted-foreground">Date</div><div className="font-medium">{d.reported_at ? new Date(d.reported_at).toLocaleDateString() : "—"}</div></div>
                  <div><div className="text-muted-foreground">Severity</div><div className="font-medium">{d.severity ?? "—"}</div></div>
                  <div><div className="text-muted-foreground">Est. cost</div><div className="font-medium tabular-nums">{d.estimated_cost ? `€${Number(d.estimated_cost).toFixed(0)}` : "—"}</div></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
