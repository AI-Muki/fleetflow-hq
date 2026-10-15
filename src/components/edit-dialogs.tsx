import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, EnumSelect, NumberInput, FormDialog, useDialog } from "@/components/form-kit";
import { useUpdateAsset, useUpdateDriver, useUpdateMaintenance } from "@/lib/fleet-queries";

const num = (v: string) => (v === "" ? null : Number(v));
const s = (v: unknown) => (v == null ? "" : String(v));
const EditTrigger = () => (
  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
);

export function EditAssetDialog({ asset }: { asset: any }) {
  const d = useDialog();
  const upd = useUpdateAsset();
  const [f, setF] = useState(() => ({
    name: s(asset.name), plate: s(asset.plate), vin: s(asset.vin), make: s(asset.make), model: s(asset.model),
    year: s(asset.year), vehicle_type: s(asset.vehicle_type), fuel_type: s(asset.fuel_type),
    odometer: s(asset.odometer), status: s(asset.status) || "active", notes: s(asset.notes),
    service_interval_km: s(asset.service_interval_km ?? 15000),
  }));
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <FormDialog
      open={d.open} onOpenChange={d.onOpenChange} trigger={<EditTrigger />} title="Edit vehicle"
      pending={upd.isPending} canSubmit={!!f.name}
      onSubmit={async () => {
        try {
          await upd.mutateAsync({
            id: asset.id, name: f.name, plate: f.plate || null, vin: f.vin || null, make: f.make || null,
            model: f.model || null, year: num(f.year), vehicle_type: f.vehicle_type || null,
            fuel_type: f.fuel_type || null, odometer: num(f.odometer), status: f.status as never, notes: f.notes || null,
            ...(Number(f.service_interval_km) > 0 ? { service_interval_km: Number(f.service_interval_km) } : {}),
          });
          toast.success("Vehicle updated"); d.setOpen(false);
        } catch (e: any) { toast.error(e.message); }
      }}
    >
      <div className="sm:col-span-2"><Field label="Name"><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></Field></div>
      <Field label="Plate"><Input value={f.plate} onChange={(e) => set("plate", e.target.value)} /></Field>
      <Field label="VIN"><Input value={f.vin} onChange={(e) => set("vin", e.target.value)} /></Field>
      <Field label="Make"><Input value={f.make} onChange={(e) => set("make", e.target.value)} /></Field>
      <Field label="Model"><Input value={f.model} onChange={(e) => set("model", e.target.value)} /></Field>
      <Field label="Year"><NumberInput value={f.year} onChange={(e) => set("year", e.target.value)} /></Field>
      <Field label="Odometer (km)"><NumberInput value={f.odometer} onChange={(e) => set("odometer", e.target.value)} /></Field>
      <Field label="Service every (km)"><NumberInput value={f.service_interval_km} onChange={(e) => set("service_interval_km", e.target.value)} /></Field>
      <Field label="Type"><Input value={f.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)} /></Field>
      <Field label="Fuel"><Input value={f.fuel_type} onChange={(e) => set("fuel_type", e.target.value)} /></Field>
      <div className="sm:col-span-2"><Field label="Status"><EnumSelect value={f.status} onChange={(v) => set("status", v)} options={["active", "in_maintenance", "unavailable", "retired"]} /></Field></div>
      <div className="sm:col-span-2"><Field label="Notes"><Input value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field></div>
    </FormDialog>
  );
}

export function EditDriverDialog({ driver }: { driver: any }) {
  const d = useDialog();
  const upd = useUpdateDriver();
  const [f, setF] = useState(() => ({
    full_name: s(driver.full_name), email: s(driver.email), phone: s(driver.phone),
    license_number: s(driver.license_number), license_expiry: s(driver.license_expiry),
    status: s(driver.status) || "active", notes: s(driver.notes),
  }));
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <FormDialog
      open={d.open} onOpenChange={d.onOpenChange} trigger={<EditTrigger />} title="Edit driver"
      pending={upd.isPending} canSubmit={!!f.full_name}
      onSubmit={async () => {
        try {
          await upd.mutateAsync({
            id: driver.id, full_name: f.full_name, email: f.email || null, phone: f.phone || null,
            license_number: f.license_number || null, license_expiry: f.license_expiry || null,
            status: f.status as never, notes: f.notes || null,
          });
          toast.success("Driver updated"); d.setOpen(false);
        } catch (e: any) { toast.error(e.message); }
      }}
    >
      <div className="sm:col-span-2"><Field label="Full name"><Input value={f.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field></div>
      <Field label="Email"><Input value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
      <Field label="Phone"><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
      <Field label="Licence number"><Input value={f.license_number} onChange={(e) => set("license_number", e.target.value)} /></Field>
      <Field label="Licence expiry"><Input type="date" value={f.license_expiry} onChange={(e) => set("license_expiry", e.target.value)} /></Field>
      <div className="sm:col-span-2"><Field label="Status"><EnumSelect value={f.status} onChange={(v) => set("status", v)} options={["active", "suspended", "inactive"]} /></Field></div>
      <div className="sm:col-span-2"><Field label="Notes"><Input value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field></div>
    </FormDialog>
  );
}

export function EditMaintenanceDialog({ job }: { job: any }) {
  const d = useDialog();
  const upd = useUpdateMaintenance();
  const [f, setF] = useState(() => ({
    type: s(job.type) || "scheduled", status: s(job.status) || "scheduled",
    scheduled_date: s(job.scheduled_date), completed_date: s(job.completed_date),
    cost: s(job.cost), odometer: s(job.odometer), vendor: s(job.vendor), description: s(job.description),
  }));
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <FormDialog
      open={d.open} onOpenChange={d.onOpenChange} trigger={<EditTrigger />} title="Edit service"
      pending={upd.isPending}
      onSubmit={async () => {
        try {
          await upd.mutateAsync({
            id: job.id, type: f.type as never, status: f.status as never,
            scheduled_date: f.scheduled_date || null, completed_date: f.completed_date || null,
            cost: num(f.cost), odometer: num(f.odometer), vendor: f.vendor || null, description: f.description || null,
          });
          toast.success("Service updated"); d.setOpen(false);
        } catch (e: any) { toast.error(e.message); }
      }}
    >
      <Field label="Type"><EnumSelect value={f.type} onChange={(v) => set("type", v)} options={["scheduled", "repair", "inspection"]} /></Field>
      <Field label="Status"><EnumSelect value={f.status} onChange={(v) => set("status", v)} options={["scheduled", "in_progress", "completed", "cancelled"]} /></Field>
      <Field label="Scheduled date"><Input type="date" value={f.scheduled_date} onChange={(e) => set("scheduled_date", e.target.value)} /></Field>
      <Field label="Completed date"><Input type="date" value={f.completed_date} onChange={(e) => set("completed_date", e.target.value)} /></Field>
      <Field label="Cost (€)"><NumberInput value={f.cost} onChange={(e) => set("cost", e.target.value)} /></Field>
      <Field label="Odometer (km)"><NumberInput value={f.odometer} onChange={(e) => set("odometer", e.target.value)} /></Field>
      <div className="sm:col-span-2"><Field label="Vendor"><Input value={f.vendor} onChange={(e) => set("vendor", e.target.value)} /></Field></div>
      <div className="sm:col-span-2"><Field label="Description"><Input value={f.description} onChange={(e) => set("description", e.target.value)} /></Field></div>
    </FormDialog>
  );
}
