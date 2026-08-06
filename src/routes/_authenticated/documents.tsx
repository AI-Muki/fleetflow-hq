import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import { useDocuments } from "@/lib/fleet-queries";
import { NewDocumentDialog } from "@/components/fleet-dialogs";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({ meta: [{ title: "Documents — FleetFlow" }] }),
  component: DocsPage,
});

function DocsPage() {
  const { data: docs = [], isLoading } = useDocuments();
  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="Registration, insurance, service books, invoices and more."
        actions={<NewDocumentDialog />}
      />
      <PageBody>
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground"><Loader2 className="h-4 w-4 inline animate-spin mr-2" />Loading…</div>
        ) : docs.length === 0 ? (
          <Card className="p-10 text-center border-dashed">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-medium">Drag & drop to upload</h3>
            <p className="mt-1 text-sm text-muted-foreground">Registration, insurance, invoices and more — all in one place.</p>
            <div className="mt-4 flex justify-center"><NewDocumentDialog /></div>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Document</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Linked to</th>
                  <th className="text-left px-4 py-3 font-medium">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d: any) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{d.name ?? "Document"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.kind ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.asset?.name ? `${d.asset.name}` : d.driver?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{d.expiry_date ?? "—"}</td>
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
