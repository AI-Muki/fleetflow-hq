import { createFileRoute, Link } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, QrCode, Truck, Gauge, Fuel, User, Loader2 } from "lucide-react";
import { useAsset } from "@/lib/fleet-queries";

export const Route = createFileRoute("/_authenticated/assets/$id")({
  head: () => ({ meta: [{ title: `Asset — FleetFlow` }] }),
  component: AssetDetail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">
      Asset not found. <Link to="/assets" className="text-primary underline">Back to assets</Link>
    </div>
  ),
});

function AssetDetail() {
  const { id } = Route.useParams();
  const { data: asset, isLoading } = useAsset(id);

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground"><Loader2 className="h-4 w-4 inline animate-spin mr-2" />Loading…</div>;
  }
  if (!asset) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Asset not found. <Link to="/assets" className="text-primary underline">Back to assets</Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={asset.name}
        subtitle={[asset.make, asset.model, asset.year].filter(Boolean).join(" · ") || asset.vehicle_type || "—"}
        actions={
          <>
            <Link to="/assets"><Button variant="ghost" size="sm" className="gap-1.5"><ArrowLeft className="h-4 w-4" />All assets</Button></Link>
            <Button variant="outline" size="sm" className="gap-1.5"><QrCode className="h-4 w-4" />QR label</Button>
            <Button size="sm">Assign driver</Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Truck className="h-9 w-9" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{asset.name}</h2>
                  <Badge variant="outline">{asset.status}</Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground font-mono">
                  {asset.plate ?? "—"}{asset.vin && ` · VIN ${asset.vin.slice(0, 12)}…`}
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Metric icon={Gauge} label="Odometer" value={`${(asset.odometer ?? 0).toLocaleString()} km`} />
                  <Metric icon={Fuel} label="Fuel" value={asset.fuel_type ?? "—"} />
                  <Metric icon={User} label="Type" value={asset.vehicle_type ?? "—"} />
                  <Metric icon={QrCode} label="ID" value={asset.id.slice(0, 8)} />
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4 grid gap-3 md:grid-cols-2">
                <Info label="Make" value={asset.make ?? "—"} />
                <Info label="Model" value={asset.model ?? "—"} />
                <Info label="Year" value={asset.year ? String(asset.year) : "—"} />
                <Info label="Type" value={asset.vehicle_type ?? "—"} />
                <Info label="Fuel type" value={asset.fuel_type ?? "—"} />
                <Info label="Status" value={asset.status} />
                <Info label="Notes" value={asset.notes ?? "—"} />
              </TabsContent>
              <TabsContent value="assignments" className="mt-4 text-sm text-muted-foreground">No assignments yet.</TabsContent>
              <TabsContent value="maintenance" className="mt-4 text-sm text-muted-foreground">No maintenance records yet.</TabsContent>
              <TabsContent value="documents" className="mt-4 text-sm text-muted-foreground">No documents attached.</TabsContent>
            </Tabs>
          </Card>
          <div />
        </div>
      </PageBody>
    </>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
