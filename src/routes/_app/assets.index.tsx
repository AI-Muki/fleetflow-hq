import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageBody, PageHeader } from "@/components/page-shell";
import { assets, type AssetStatus } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Plus, Filter, Download, Truck } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/assets/")({
  head: () => ({
    meta: [{ title: "Assets — FleetFlow" }, { name: "description", content: "All company vehicles and equipment." }],
  }),
  component: AssetsPage,
});

const statusMap: Record<AssetStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/10 text-success border-success/20" },
  service: { label: "In service", className: "bg-warning/10 text-warning-foreground border-warning/30" },
  out: { label: "Out of service", className: "bg-destructive/10 text-destructive border-destructive/20" },
  reserved: { label: "Reserved", className: "bg-info/10 text-info border-info/20" },
};

function AssetsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => Array.from(new Set(assets.map(a => a.category))), []);
  const filtered = assets.filter(a =>
    (status === "all" || a.status === status) &&
    (category === "all" || a.category === category) &&
    (q === "" || `${a.name} ${a.plate} ${a.vin} ${a.driver ?? ""}`.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <PageHeader
        title="Assets"
        subtitle={`${filtered.length} of ${assets.length} vehicles & equipment`}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New asset</Button>
          </>
        }
      />
      <PageBody>
        <Card className="p-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search plate, VIN, driver…" className="pl-9 h-9" />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="service">In service</SelectItem>
                <SelectItem value="out">Out of service</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                  <th className="text-left font-medium px-4 py-3">Category</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Driver</th>
                  <th className="text-right font-medium px-4 py-3">Mileage</th>
                  <th className="text-left font-medium px-4 py-3">Location</th>
                  <th className="text-left font-medium px-4 py-3">Next service</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const s = statusMap[a.status];
                  return (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link to="/assets/$id" params={{ id: a.id }} className="flex items-center gap-3 group">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                            <Truck className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium group-hover:text-primary transition-colors">{a.name}</div>
                            <div className="text-xs text-muted-foreground">{a.id} · {a.year}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{a.plate}</td>
                      <td className="px-4 py-3">{a.category}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={s.className}>{s.label}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{a.driver ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{a.mileage.toLocaleString()} km</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.location}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.nextService}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">No assets match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </PageBody>
    </>
  );
}
