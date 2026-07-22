import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, FileCheck2, FileClock } from "lucide-react";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — FleetFlow" }] }),
  component: DocsPage,
});

const groups = [
  { name: "Registration", count: 284, icon: FileCheck2, tone: "text-primary" },
  { name: "Insurance", count: 267, icon: FileCheck2, tone: "text-success" },
  { name: "Technical inspection", count: 189, icon: FileClock, tone: "text-warning" },
  { name: "Service books", count: 412, icon: FileText, tone: "text-info" },
  { name: "Invoices", count: 1240, icon: FileText, tone: "text-muted-foreground" },
  { name: "Warranty", count: 76, icon: FileCheck2, tone: "text-primary" },
];

function DocsPage() {
  return (
    <>
      <PageHeader title="Documents" subtitle="Registration, insurance, service books, invoices and more."
        actions={<Button size="sm" className="gap-1.5"><Upload className="h-4 w-4"/>Upload</Button>} />
      <PageBody>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {groups.map(g => (
            <Card key={g.name} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
              <g.icon className={`h-8 w-8 ${g.tone}`} />
              <div className="mt-4 text-2xl font-semibold tabular-nums">{g.count}</div>
              <div className="text-sm text-muted-foreground">{g.name}</div>
            </Card>
          ))}
        </div>
        <Card className="mt-4 p-10 text-center border-dashed">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-medium">Drag & drop to upload</h3>
          <p className="mt-1 text-sm text-muted-foreground">AI extracts registration, invoice and insurance data automatically.</p>
          <Button className="mt-4">Browse files</Button>
        </Card>
      </PageBody>
    </>
  );
}
