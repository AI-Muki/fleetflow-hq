import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useAssignments } from "@/lib/fleet-queries";
import { HandoverDialog, ReturnAssignmentDialog } from "@/components/fleet-dialogs";

export const Route = createFileRoute("/_authenticated/assignments")({
  head: () => ({ meta: [{ title: "Assignments — FleetFlow" }] }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const { data: assignments = [], isLoading } = useAssignments();
  const active = assignments.filter((a: any) => a.status === "active");

  return (
    <>
      <PageHeader
        title="Vehicle assignments"
        subtitle="Assign, transfer, hand over and return vehicles with full history."
        actions={<HandoverDialog />}
      />
      <PageBody>
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground"><Loader2 className="h-4 w-4 inline animate-spin mr-2" />Loading…</div>
        ) : assignments.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            No assignments yet. Assign a vehicle to a driver to start tracking handovers.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Driver</th>
                  <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                  <th className="text-left px-4 py-3 font-medium">Since</th>
                  <th className="text-right px-4 py-3 font-medium">Odometer @ pickup</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {active.map((a: any) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{a.driver?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.asset?.name} · {a.asset?.plate}</td>
                    <td className="px-4 py-3">{a.start_at ? new Date(a.start_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{(a.start_odometer ?? 0).toLocaleString()} km</td>
                    <td className="px-4 py-3"><Badge variant="outline">{a.status}</Badge></td>
                    <td className="px-4 py-3 text-right">{a.status === "active" ? (<ReturnAssignmentDialog assignmentId={a.id} label={`${a.asset?.name ?? ""} → ${a.driver?.full_name ?? ""}`} />) : null}</td>
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
