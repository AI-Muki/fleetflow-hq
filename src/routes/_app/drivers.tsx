import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { driversList } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone, Mail, IdCard } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/drivers")({
  head: () => ({ meta: [{ title: "Drivers — FleetFlow" }, { name: "description", content: "All company drivers and license status." }] }),
  component: DriversPage,
});

function initials(n: string) { return n.split(" ").map(x=>x[0]).slice(0,2).join(""); }

function DriversPage() {
  const [q, setQ] = useState("");
  const filtered = driversList.filter(d => `${d.name} ${d.email} ${d.employeeId} ${d.phone}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Drivers"
        subtitle={`${driversList.length} team members · ${driversList.filter(d=>d.status==="active").length} active`}
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add driver</Button>}
      />
      <PageBody>
        <Card className="p-3 mb-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search drivers…" className="pl-9 h-9" />
          </div>
        </Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(d => (
            <Card key={d.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials(d.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold truncate">{d.name}</h4>
                    <Badge variant="outline" className={
                      d.status==="active" ? "bg-success/10 text-success border-success/20"
                      : d.status==="leave" ? "bg-warning/10 text-warning-foreground border-warning/30"
                      : "bg-muted"
                    }>{d.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{d.employeeId}</div>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" />{d.phone}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3 w-3" />{d.email}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><IdCard className="h-3 w-3" />License {d.license} · exp {d.licenseExpiry}</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Current vehicle</span>
                <span className="text-xs font-mono">{d.currentVehicle ?? "—"}</span>
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </>
  );
}
