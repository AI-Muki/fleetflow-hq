import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { assets } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, QrCode, Truck, MapPin, Gauge, Fuel, Wrench, CalendarDays, User,
} from "lucide-react";

export const Route = createFileRoute("/_app/assets/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — FleetFlow` }] }),
  loader: ({ params }) => {
    const asset = assets.find(a => a.id === params.id);
    if (!asset) throw notFound();
    return { asset };
  },
  component: AssetDetail,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Asset not found. <Link to="/assets" className="text-primary underline">Back to assets</Link></div>,
});

function AssetDetail() {
  const { asset } = Route.useLoaderData();
  return (
    <>
      <PageHeader
        title={asset.name}
        subtitle={`${asset.id} · ${asset.category} · ${asset.year}`}
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
                <div className="mt-1 text-sm text-muted-foreground font-mono">{asset.plate} · VIN {asset.vin.slice(0, 12)}…</div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Metric icon={Gauge} label="Mileage" value={`${asset.mileage.toLocaleString()} km`} />
                  <Metric icon={Fuel} label="Fuel" value={asset.fuel} />
                  <Metric icon={MapPin} label="Location" value={asset.location} />
                  <Metric icon={User} label="Driver" value={asset.driver ?? "Unassigned"} />
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="damage">Damage</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4 grid gap-3 md:grid-cols-2">
                <Info label="Manufacturer" value={asset.manufacturer} />
                <Info label="Model" value={asset.model} />
                <Info label="Year" value={String(asset.year)} />
                <Info label="Category" value={asset.category} />
                <Info label="Fuel type" value={asset.fuel} />
                <Info label="Registration expiry" value={asset.regExpiry} />
                <Info label="Next service" value={asset.nextService} />
                <Info label="Internal ID" value={asset.id} />
              </TabsContent>
              <TabsContent value="assignments" className="mt-4">
                <ol className="relative border-l pl-6 space-y-4">
                  {[
                    { d: "Ahmed Karim", from: "Jan 2", to: "Jan 15" },
                    { d: "John Peters", from: "Jan 15", to: "Feb 8" },
                    { d: "Michael Novak", from: "Feb 8", to: "Present", current: true },
                  ].map((a, i) => (
                    <li key={i}>
                      <span className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full ${a.current ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground/40"}`} />
                      <div className="text-sm font-medium">{a.d}</div>
                      <div className="text-xs text-muted-foreground">{a.from} → {a.to}</div>
                    </li>
                  ))}
                </ol>
              </TabsContent>
              <TabsContent value="maintenance" className="mt-4 text-sm text-muted-foreground">Maintenance history appears in Phase 3.</TabsContent>
              <TabsContent value="documents" className="mt-4 text-sm text-muted-foreground">Documents appear in Phase 2.</TabsContent>
              <TabsContent value="damage" className="mt-4 text-sm text-muted-foreground">No open damage reports for this asset.</TabsContent>
            </Tabs>
          </Card>

          <div className="space-y-3">
            <Card className="p-4">
              <h4 className="text-sm font-semibold">Upcoming</h4>
              <ul className="mt-2 divide-y">
                <UpcomingRow icon={CalendarDays} title="Registration" date={asset.regExpiry} />
                <UpcomingRow icon={Wrench} title="Scheduled service" date={asset.nextService} />
                <UpcomingRow icon={CalendarDays} title="Technical inspection" date="2026-05-11" />
              </ul>
            </Card>
            <Card className="p-4">
              <h4 className="text-sm font-semibold">Quick QR</h4>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-24 w-24 rounded-lg border-2 border-dashed grid place-items-center text-muted-foreground">
                  <QrCode className="h-10 w-10" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Scan to open this asset profile.
                  <div className="mt-2"><Button size="sm" variant="outline">Print label</Button></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}

function Metric({ icon: Icon, label, value }: any) {
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
function UpcomingRow({ icon: Icon, title, date }: any) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 text-sm">{title}</div>
      <div className="text-xs tabular-nums text-muted-foreground">{date}</div>
    </li>
  );
}
