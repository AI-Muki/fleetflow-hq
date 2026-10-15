import { useMemo } from "react";
import { Gauge, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAssets, useCreateMaintenance, useMaintenance } from "@/lib/fleet-queries";
import { serviceDueByMileage } from "@/lib/fleet-analytics";

export function ServiceDueCard() {
  const { data: assets = [] } = useAssets();
  const { data: jobs = [] } = useMaintenance();
  const create = useCreateMaintenance();
  const due = useMemo(() => serviceDueByMileage(assets, jobs).filter((d) => d.severity !== "ok"), [assets, jobs]);
  if (due.length === 0) return null;

  return (
    <Card className="mb-4 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Gauge className="h-4 w-4 text-primary" />Service due by mileage</h3>
      <p className="text-xs text-muted-foreground">Based on each vehicle's odometer and service interval.</p>
      <div className="mt-3 divide-y">
        {due.map((d) => (
          <div key={d.assetId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div>
              <div className="font-medium">{d.name}{d.plate ? ` · ${d.plate}` : ""}</div>
              <div className="text-xs text-muted-foreground">
                {d.odometer.toLocaleString()} km · due at {d.dueAtKm.toLocaleString()} km
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={d.severity === "overdue" ? "destructive" : "secondary"}>
                {d.remainingKm <= 0 ? `${Math.abs(d.remainingKm).toLocaleString()} km over` : `${d.remainingKm.toLocaleString()} km left`}
              </Badge>
              {d.hasOpenJob ? (
                <span className="text-xs text-muted-foreground">Scheduled</span>
              ) : (
                <Button size="sm" variant="outline" className="gap-1.5" disabled={create.isPending}
                  onClick={async () => {
                    try {
                      await create.mutateAsync({
                        asset_id: d.assetId, type: "scheduled", status: "scheduled",
                        scheduled_date: new Date().toISOString().slice(0, 10),
                        description: `Regular service due at ${d.dueAtKm} km`,
                      });
                      toast.success("Service scheduled");
                    } catch (e: any) { toast.error(e.message); }
                  }}>
                  <CalendarPlus className="h-4 w-4" />Schedule
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
