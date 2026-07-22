import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_app/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — FleetFlow" }] }),
  component: MaintPage,
});

const jobs = [
  { id: "MNT-4021", vehicle: "Volvo FH16 · GR-108-BM", type: "Major Service", due: "2026-07-30", km: 15000, status: "Overdue", cost: 1240 },
  { id: "MNT-4022", vehicle: "Mercedes Sprinter · BE-142-AC", type: "Oil Change", due: "2026-08-02", km: 8000, status: "Upcoming", cost: 180 },
  { id: "MNT-4023", vehicle: "Ford Transit · FL-129-CP", type: "Brake Service", due: "2026-08-11", km: 4000, status: "Upcoming", cost: 460 },
  { id: "MNT-4024", vehicle: "MAN TGX · ZG-131-EM", type: "Tire Rotation", due: "2026-07-24", km: 2000, status: "Scheduled", cost: 120 },
  { id: "MNT-4019", vehicle: "Iveco Daily · MU-118-DR", type: "Minor Service", due: "2026-07-15", km: 0, status: "Completed", cost: 340 },
];

const statusIcon = { Overdue: AlertCircle, Upcoming: Clock, Scheduled: Clock, Completed: CheckCircle2 };
const statusClass = {
  Overdue: "bg-destructive/10 text-destructive border-destructive/20",
  Upcoming: "bg-warning/10 text-warning-foreground border-warning/30",
  Scheduled: "bg-info/10 text-info border-info/20",
  Completed: "bg-success/10 text-success border-success/20",
} as const;

function MaintPage() {
  return (
    <>
      <PageHeader
        title="Maintenance"
        subtitle="Scheduled by mileage, engine hours or date — whichever comes first."
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Log service</Button>}
      />
      <PageBody>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Job</th>
                <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Due</th>
                <th className="text-right px-4 py-3 font-medium">Δ km</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => {
                const Icon = statusIcon[j.status as keyof typeof statusIcon];
                return (
                  <tr key={j.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/8 text-primary grid place-items-center"><Wrench className="h-4 w-4"/></div>
                        <span className="font-mono text-xs">{j.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{j.vehicle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{j.type}</td>
                    <td className="px-4 py-3 tabular-nums">{j.due}</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${j.km<0?"text-destructive":""}`}>{j.km>0?"+":""}{j.km.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={statusClass[j.status as keyof typeof statusClass]}>
                        <Icon className="h-3 w-3 mr-1 inline" />{j.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">€{j.cost.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </PageBody>
    </>
  );
}
