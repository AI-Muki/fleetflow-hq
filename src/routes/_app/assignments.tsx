import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Camera, PenLine, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/assignments")({
  head: () => ({ meta: [{ title: "Assignments — FleetFlow" }] }),
  component: AssignmentsPage,
});

const active = [
  { id: "ASG-9812", driver: "Ahmed Karim", vehicle: "Mercedes Sprinter · BE-142-AC", since: "Jul 18", mileage: 128420, fuel: "3/4" },
  { id: "ASG-9808", driver: "John Peters", vehicle: "Volvo FH16 · GR-108-BM", since: "Jul 12", mileage: 402180, fuel: "1/2" },
  { id: "ASG-9805", driver: "Michael Novak", vehicle: "Ford Transit · FL-129-CP", since: "Jul 05", mileage: 87910, fuel: "Full" },
  { id: "ASG-9799", driver: "Marko Jović", vehicle: "MAN TGX · ZG-131-EM", since: "Jun 28", mileage: 215600, fuel: "1/4" },
];

function AssignmentsPage() {
  return (
    <>
      <PageHeader
        title="Vehicle assignments"
        subtitle="Assign, transfer, hand over and return vehicles with full history."
        actions={<Button size="sm" className="gap-1.5">New assignment <ArrowRight className="h-4 w-4" /></Button>}
      />
      <PageBody>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="handover">Handover flow</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">ID</th>
                    <th className="text-left px-4 py-3 font-medium">Driver</th>
                    <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                    <th className="text-left px-4 py-3 font-medium">Since</th>
                    <th className="text-right px-4 py-3 font-medium">Mileage @ pickup</th>
                    <th className="text-left px-4 py-3 font-medium">Fuel</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {active.map(a => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{a.id}</td>
                      <td className="px-4 py-3 font-medium">{a.driver}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.vehicle}</td>
                      <td className="px-4 py-3">{a.since}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{a.mileage.toLocaleString()} km</td>
                      <td className="px-4 py-3"><Badge variant="outline">{a.fuel}</Badge></td>
                      <td className="px-4 py-3 text-right"><Button size="sm" variant="outline">Return</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="handover" className="mt-4">
            <div className="grid gap-3 lg:grid-cols-3">
              <StepCard n={1} title="Vehicle handover" icon={CheckCircle2}
                items={["Mileage & fuel level","Cleanliness & tire condition","Interior / exterior condition","Lights & documents","Keys, spare wheel, first aid","Fire extinguisher, safety kit"]} />
              <StepCard n={2} title="Before photos" icon={Camera}
                items={["Front","Rear","Left side","Right side","Interior","Dashboard","Existing damage"]} />
              <StepCard n={3} title="Digital signature" icon={PenLine}
                items={["Driver confirms condition","Manager counter-signs","Assignment starts","Return inspection auto-compares before/after"]} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4 text-sm text-muted-foreground">
            Full assignment history with timeline appears in Phase 2.
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

function StepCard({ n, title, icon: Icon, items }: any) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center text-sm font-semibold">{n}</div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <Icon className="ml-auto h-4 w-4 text-muted-foreground" />
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {items.map((i: string) => (
          <li key={i} className="flex items-start gap-2 text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-success shrink-0" />{i}
          </li>
        ))}
      </ul>
    </Card>
  );
}
