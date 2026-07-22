import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { damageReports } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/damage-reports")({
  head: () => ({ meta: [{ title: "Damage reports — FleetFlow" }] }),
  component: DamagePage,
});

function DamagePage() {
  return (
    <>
      <PageHeader
        title="Damage reports"
        subtitle={`${damageReports.length} reports · ${damageReports.filter(d=>d.status==="Open").length} open`}
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New report</Button>}
      />
      <PageBody>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {damageReports.map(d => (
            <Card key={d.id} className="p-5 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-destructive/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive grid place-items-center">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-sm font-semibold">{d.id}</span>
                  </div>
                  <Badge variant="outline" className={
                    d.status==="Open" ? "bg-destructive/10 text-destructive border-destructive/20"
                    : d.status==="In Progress" ? "bg-warning/10 text-warning-foreground border-warning/30"
                    : "bg-muted"
                  }>{d.status}</Badge>
                </div>
                <h3 className="mt-4 text-sm font-semibold">{d.vehicle}</h3>
                <p className="text-xs text-muted-foreground">Driver: {d.driver}</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div><div className="text-muted-foreground">Date</div><div className="font-medium">{d.date}</div></div>
                  <div><div className="text-muted-foreground">Severity</div><div className="font-medium">{d.severity}</div></div>
                  <div><div className="text-muted-foreground">Est. cost</div><div className="font-medium tabular-nums">€{d.cost.toLocaleString()}</div></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">View</Button>
                  <Button size="sm" className="flex-1">Assign shop</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </>
  );
}
