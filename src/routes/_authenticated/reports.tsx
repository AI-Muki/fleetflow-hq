import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Fuel, Wrench, Users, Clock, DownloadCloud } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — FleetFlow" }] }),
  component: ReportsPage,
});

const reports = [
  { name: "Fleet cost report", icon: BarChart3, desc: "Total spend, breakdowns, YoY trend." },
  { name: "Maintenance report", icon: Wrench, desc: "Completed, overdue, cost per vehicle." },
  { name: "Fuel report", icon: Fuel, desc: "Consumption, cost/km, station analysis." },
  { name: "Driver report", icon: Users, desc: "Assignments, activity, incidents." },
  { name: "Vehicle utilization", icon: Clock, desc: "Active hours vs idle time." },
  { name: "Upcoming expirations", icon: FileText, desc: "Reg, insurance, inspections, licenses." },
];

function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" subtitle="Generate and export operational reports." />
      <PageBody>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {reports.map(r => (
            <Card key={r.name} className="p-5 group hover:shadow-md transition-shadow">
              <r.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{r.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1.5"><DownloadCloud className="h-4 w-4"/>PDF</Button>
                <Button size="sm" variant="outline" className="flex-1">Excel</Button>
                <Button size="sm" variant="outline" className="flex-1">CSV</Button>
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </>
  );
}
