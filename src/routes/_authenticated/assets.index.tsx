import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Plus, Filter, Download, Truck, Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAssets, useCreateAsset } from "@/lib/fleet-queries";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/assets/")({
  head: () => ({
    meta: [{ title: "Assets — FleetFlow" }, { name: "description", content: "All company vehicles and equipment." }],
  }),
  component: AssetsPage,
});

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/10 text-success border-success/20" },
  in_maintenance: { label: "In service", className: "bg-warning/10 text-warning-foreground border-warning/30" },
  retired: { label: "Retired", className: "bg-muted text-muted-foreground border-border" },
  unavailable: { label: "Out of service", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

function AssetsPage() {
  const { data: assets = [], isLoading } = useAssets();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(
    () =>
      assets.filter(
        (a) =>
          (status === "all" || a.status === status) &&
          (q === "" ||
            `${a.name} ${a.plate ?? ""} ${a.vin ?? ""}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [assets, q, status],
  );

  return (
    <>
      <PageHeader
        title="Assets"
        subtitle={`${filtered.length} of ${assets.length} vehicles & equipment`}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
            <NewAssetDialog />
          </>
        }
      />
      <PageBody>
        <Card className="p-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search plate, VIN, name…" className="pl-9 h-9" />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_maintenance">In service</SelectItem>
                <SelectItem value="unavailable">Out of service</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9 gap-1.5"><Filter className="h-4 w-4" />More filters</Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Asset</th>
                  <th className="text-left font-medium px-4 py-3">Plate</th>
                  <th className="text-left font-medium px-4 py-3">Type</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Odometer</th>
                  <th className="text-left font-medium px-4 py-3">Fuel</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading…
                  </td></tr>
                )}
                {!isLoading && filtered.map((a) => {
                  const s = statusMap[a.status] ?? statusMap.active;
                  return (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link to="/assets/$id" params={{ id: a.id }} className="flex items-center gap-3 group">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                            <Truck className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium group-hover:text-primary transition-colors">{a.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {[a.make, a.model, a.year].filter(Boolean).join(" · ") || "—"}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{a.plate ?? "—"}</td>
                      <td className="px-4 py-3">{a.vehicle_type ?? "—"}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={s.className}>{s.label}</Badge></td>
                      <td className="px-4 py-3 text-right tabular-nums">{(a.odometer ?? 0).toLocaleString()} km</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{a.fuel_type ?? "—"}</td>
                    </tr>
                  );
                })}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                    {assets.length === 0 ? "No assets yet. Add your first vehicle to get started." : "No assets match your filters."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </>
  );
}

function NewAssetDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateAsset();
  const [form, setForm] = useState({ name: "", plate: "", make: "", model: "", year: "", vehicle_type: "", fuel_type: "diesel", odometer: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        name: form.name,
        plate: form.plate || undefined,
        make: form.make || undefined,
        model: form.model || undefined,
        year: form.year ? Number(form.year) : undefined,
        vehicle_type: form.vehicle_type || undefined,
        fuel_type: form.fuel_type || undefined,
        odometer: form.odometer ? Number(form.odometer) : 0,
      });
      toast.success("Asset added");
      setOpen(false);
      setForm({ name: "", plate: "", make: "", model: "", year: "", vehicle_type: "", fuel_type: "diesel", odometer: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add asset");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New asset</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a vehicle</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label>Name</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Van #12" />
          </div>
          <div className="space-y-1.5">
            <Label>Plate</Label>
            <Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Input value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} placeholder="Van, Truck…" />
          </div>
          <div className="space-y-1.5">
            <Label>Make</Label>
            <Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Model</Label>
            <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Odometer (km)</Label>
            <Input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Fuel</Label>
            <Select value={form.fuel_type} onValueChange={(v) => setForm({ ...form, fuel_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="lpg">LPG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? "Adding…" : "Add asset"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
