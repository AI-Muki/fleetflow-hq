import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Phone, Mail, IdCard, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useDrivers, useCreateDriver } from "@/lib/fleet-queries";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/drivers")({
  head: () => ({ meta: [{ title: "Drivers — FleetFlow" }, { name: "description", content: "All company drivers and license status." }] }),
  component: DriversPage,
});

function initials(n: string) { return n.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase(); }

function DriversPage() {
  const { data: drivers = [], isLoading } = useDrivers();
  const [q, setQ] = useState("");
  const filtered = drivers.filter((d) =>
    `${d.full_name} ${d.email ?? ""} ${d.phone ?? ""} ${d.license_number ?? ""}`.toLowerCase().includes(q.toLowerCase()),
  );
  const active = drivers.filter((d) => d.status === "active").length;

  return (
    <>
      <PageHeader
        title="Drivers"
        subtitle={`${drivers.length} team members · ${active} active`}
        actions={<NewDriverDialog />}
      />
      <PageBody>
        <Card className="p-3 mb-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search drivers…" className="pl-9 h-9" />
          </div>
        </Card>
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            {drivers.length === 0 ? "No drivers yet. Add your first driver to get started." : "No drivers match your search."}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <Card key={d.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials(d.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold truncate">{d.full_name}</h4>
                      <Badge variant="outline" className={
                        d.status === "active" ? "bg-success/10 text-success border-success/20"
                        : d.status === "suspended" ? "bg-warning/10 text-warning-foreground border-warning/30"
                        : "bg-muted"
                      }>{d.status}</Badge>
                    </div>
                    <div className="mt-3 space-y-1.5 text-xs">
                      {d.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" />{d.phone}</div>}
                      {d.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3 w-3" />{d.email}</div>}
                      {d.license_number && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <IdCard className="h-3 w-3" />License {d.license_number}
                          {d.license_expiry && ` · exp ${d.license_expiry}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}

function NewDriverDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateDriver();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", license_number: "", license_expiry: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        full_name: form.full_name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        license_number: form.license_number || undefined,
        license_expiry: form.license_expiry || undefined,
      });
      toast.success("Driver added");
      setOpen(false);
      setForm({ full_name: "", email: "", phone: "", license_number: "", license_expiry: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add driver");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add driver</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a driver</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label>Full name</Label>
            <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>License #</Label>
            <Input value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>License expiry</Label>
            <Input type="date" value={form.license_expiry} onChange={(e) => setForm({ ...form, license_expiry: e.target.value })} />
          </div>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? "Adding…" : "Add driver"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
