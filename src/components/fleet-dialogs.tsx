import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompanyId } from "@/hooks/use-company";
import {
  AssetSelect, DriverSelect, EnumSelect, Field, FormDialog, NumberInput, today, useDialog,
} from "@/components/form-kit";
import {
  useCreateAssignment, useCreateDamageReport, useCreateDocument, useCreateExpense,
  useCreateFuelLog, useCreateMaintenance, useReturnAssignment,
} from "@/lib/fleet-queries";

const num = (v: string) => (v === "" ? null : Number(v));

/* ---------------- Maintenance ---------------- */
export function LogMaintenanceDialog() {
  const d = useDialog();
  const create = useCreateMaintenance();
  const [f, setF] = useState({
    asset_id: "", type: "scheduled", status: "scheduled",
    scheduled_date: today(), completed_date: "", cost: "", odometer: "", vendor: "", description: "",
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <FormDialog
      open={d.open} onOpenChange={d.onOpenChange}
      trigger={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Log service</Button>}
      title="Log / schedule service"
      submitLabel="Save service"
      pending={create.isPending}
      canSubmit={!!f.asset_id}
      onSubmit={async () => {
        try {
          await create.mutateAsync({
            asset_id: f.asset_id,
            type: f.type as never,
            status: f.status as never,
            scheduled_date: f.scheduled_date || null,
            completed_date: f.completed_date || null,
            cost: num(f.cost), odometer: num(f.odometer),
            vendor: f.vendor || null, description: f.description || null,
          });
          toast.success("Service saved");
          d.setOpen(false);
        } catch (e: any) { toast.error(e.message); }
      }}
    >
      <div className="sm:col-span-2"><Field label="Vehicle"><AssetSelect value={f.asset_id} onChange={(v) => set("asset_id", v)} /></Field></div>
      <Field label="Type"><EnumSelect value={f.type} onChange={(v) => set("type", v)} options={["scheduled", "repair", "inspection"]} /></Field>
      <Field label="Status"><EnumSelect value={f.status} onChange={(v) => set("status", v)} options={["scheduled", "in_progress", "completed", "cancelled"]} /></Field>
      <Field label="Scheduled date"><Input type="date" value={f.scheduled_date} onChange={(e) => set("scheduled_date", e.target.value)} /></Field>
      <Field label="Completed date"><Input type="date" value={f.completed_date} onChange={(e) => set("completed_date", e.target.value)} /></Field>
      <Field label="Cost (€)"><NumberInput value={f.cost} onChange={(e) => set("cost", e.target.value)} placeholder="0.00" /></Field>
      <Field label="Odometer (km)"><NumberInput value={f.odometer} onChange={(e) => set("odometer", e.target.value)} placeholder="0" /></Field>
      <div className="sm:col-span-2"><Field label="Vendor / workshop"><Input value={f.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="Auto servis…" /></Field></div>
      <div className="sm:col-span-2"><Field label="Notes"><Textarea rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field></div>
    </FormDialog>
  );
}

/* ---------------- Fuel ---------------- */
export function LogFuelDialog() {
  const d = useDialog();
  const create = useCreateFuelLog();
  const [f, setF] = useState({ asset_id: "", driver_id: "", liters: "", cost: "", odometer: "", station: "", logged_at: today() });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <FormDialog
      open={d.open} onOpenChange={d.onOpenChange}
      trigger={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Log fuel</Button>}
      title="Log fuel entry"
      submitLabel="Save entry"
      pending={create.isPending}
      canSubmit={!!f.asset_id && f.liters !== "" && f.cost !== ""}
      onSubmit={async () => {
        try {
          await create.mutateAsync({
            asset_id: f.asset_id,
            driver_id: f.driver_id || null,
            liters: Number(f.liters), cost: Number(f.cost),
            odometer: num(f.odometer), station: f.station || null,
            logged_at: new Date(f.logged_at).toISOString(),
          });
          toast.success("Fuel entry saved");
          d.setOpen(false);
        } catch (e: any) { toast.error(e.message); }
      }}
    >
      <Field label="Vehicle"><AssetSelect value={f.asset_id} onChange={(v) => set("asset_id", v)} /></Field>
      <Field label="Driver (optional)"><DriverSelect value={f.driver_id} onChange={(v) => set("driver_id", v)} /></Field>
      <Field label="Liters"><NumberInput value={f.liters} onChange={(e) => set("liters", e.target.value)} placeholder="0.00" /></Field>
      <Field label="Total cost (€)"><NumberInput value={f.cost} onChange={(e) => set("cost", e.target.value)} placeholder="0.00" /></Field>
      <Field label="Odometer (km)"><NumberInput value={f.odometer} onChange={(e) => set("odometer", e.target.value)} placeholder="0" /></Field>
      <Field label="Date"><Input type="date" value={f.logged_at} onChange={(e) => set("logged_at", e.target.value)} /></Field>
      <div className="sm:col-span-2"><Field label="Station"><Input value={f.station} onChange={(e) => set("station", e.target.value)} placeholder="INA, Shell…" /></Field></div>
    </FormDialog>
  );
}

/* ---------------- Expense ---------------- */
const EXPENSE_CATEGORIES = ["tolls", "parking", "insurance", "registration", "tyres", "cleaning", "fines", "other"] as const;

export function NewExpenseDialog() {
  const d = useDialog();
  const create = useCreateExpense();
  const [f, setF] = useState({ category: "other", amount: "", expense_date: today(), asset_id: "", description: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <FormDialog
      open={d.open} onOpenChange={d.onOpenChange}
      trigger={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add expense</Button>}
      title="Add expense"
      submitLabel="Save expense"
      pending={create.isPending}
      canSubmit={f.amount !== ""}
      onSubmit={async () => {
        try {
          await create.mutateAsync({
            category: f.category, amount: Number(f.amount), expense_date: f.expense_date,
            asset_id: f.asset_id || null, description: f.description || null,
          });
          toast.success("Expense saved");
          d.setOpen(false);
        } catch (e: any) { toast.error(e.message); }
      }}
    >
      <Field label="Category"><EnumSelect value={f.category} onChange={(v) => set("category", v)} options={EXPENSE_CATEGORIES} /></Field>
      <Field label="Amount (€)"><NumberInput value={f.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00" /></Field>
      <Field label="Date"><Input type="date" value={f.expense_date} onChange={(e) => set("expense_date", e.target.value)} /></Field>
      <Field label="Vehicle (optional)"><AssetSelect value={f.asset_id} onChange={(v) => set("asset_id", v)} /></Field>
      <div className="sm:col-span-2"><Field label="Description"><Textarea rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field></div>
    </FormDialog>
  );
}

/* ---------------- Damage ---------------- */
export function NewDamageDialog() {
  const d = useDialog();
  const create = useCreateDamageReport();
  const [f, setF] = useState({ asset_id: "", severity: "low", description: "", cost: "", reported_at: today() });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <FormDialog
      open={d.open} onOpenChange={d.onOpenChange}
      trigger={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Report damage</Button>}
      title="Report damage"
      submitLabel="Submit report"
      pending={create.isPending}
      canSubmit={!!f.asset_id && f.description.trim() !== ""}
      onSubmit={async () => {
        try {
          await create.mutateAsync({
            asset_id: f.asset_id, severity: f.severity as never,
            description: f.description.trim(), cost: num(f.cost),
            reported_at: new Date(f.reported_at).toISOString(),
          });
          toast.success("Damage reported");
          d.setOpen(false);
        } catch (e: any) { toast.error(e.message); }
      }}
    >
      <Field label="Vehicle"><AssetSelect value={f.asset_id} onChange={(v) => set("asset_id", v)} /></Field>
      <Field label="Severity"><EnumSelect value={f.severity} onChange={(v) => set("severity", v)} options={["low", "medium", "high", "critical"]} /></Field>
      <Field label="Estimated cost (€)"><NumberInput value={f.cost} onChange={(e) => set("cost", e.target.value)} placeholder="0.00" /></Field>
      <Field label="Date"><Input type="date" value={f.reported_at} onChange={(e) => set("reported_at", e.target.value)} /></Field>
      <div className="sm:col-span-2"><Field label="What happened?"><Textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field></div>
    </FormDialog>
  );
}

/* ---------------- Document (with upload) ---------------- */
export function NewDocumentDialog() {
  const d = useDialog();
  const create = useCreateDocument();
  const cid = useCurrentCompanyId();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [f, setF] = useState({ name: "", kind: "registration", asset_id: "", driver_id: "", expiry_date: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <FormDialog
      open={d.open} onOpenChange={d.onOpenChange}
      trigger={<Button size="sm" className="gap-1.5"><Upload className="h-4 w-4" />Add document</Button>}
      title="Add document"
      submitLabel="Save document"
      pending={create.isPending || uploading}
      canSubmit={f.name.trim() !== ""}
      onSubmit={async () => {
        try {
          let storage_path: string | null = null;
          if (file) {
            setUploading(true);
            const path = `${cid}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
            const { error } = await supabase.storage.from("documents").upload(path, file);
            setUploading(false);
            if (error) throw error;
            storage_path = path;
          }
          await create.mutateAsync({
            name: f.name.trim(), kind: f.kind as never,
            asset_id: f.asset_id || null, driver_id: f.driver_id || null,
            expiry_date: f.expiry_date || null, storage_path,
          });
          toast.success("Document saved");
          d.setOpen(false);
        } catch (e: any) { setUploading(false); toast.error(e.message); }
      }}
    >
      <div className="sm:col-span-2"><Field label="Name"><Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Registration — BS 123-A-456" /></Field></div>
      <Field label="Kind"><EnumSelect value={f.kind} onChange={(v) => set("kind", v)} options={["registration", "insurance", "inspection", "license", "other"]} /></Field>
      <Field label="Expiry date"><Input type="date" value={f.expiry_date} onChange={(e) => set("expiry_date", e.target.value)} /></Field>
      <Field label="Vehicle (optional)"><AssetSelect value={f.asset_id} onChange={(v) => set("asset_id", v)} /></Field>
      <Field label="Driver (optional)"><DriverSelect value={f.driver_id} onChange={(v) => set("driver_id", v)} /></Field>
      <div className="sm:col-span-2">
        <Field label="File (PDF or image)">
          <Input type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Field>
      </div>
    </FormDialog>
  );
}

/* ---------------- Handover (checkout) ---------------- */
export function HandoverDialog() {
  const d = useDialog();
  const create = useCreateAssignment();
  const [f, setF] = useState({ asset_id: "", driver_id: "", checkout_odometer: "", checkout_notes: "", start_at: today() });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <FormDialog
      open={d.open} onOpenChange={d.onOpenChange}
      trigger={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New handover</Button>}
      title="Vehicle handover"
      submitLabel="Hand over vehicle"
      pending={create.isPending}
      canSubmit={!!f.asset_id && !!f.driver_id}
      onSubmit={async () => {
        try {
          await create.mutateAsync({
            asset_id: f.asset_id, driver_id: f.driver_id,
            start_at: new Date(f.start_at).toISOString(),
            checkout_odometer: num(f.checkout_odometer),
            checkout_notes: f.checkout_notes || null,
          });
          toast.success("Vehicle handed over");
          d.setOpen(false);
        } catch (e: any) { toast.error(e.message); }
      }}
    >
      <Field label="Vehicle"><AssetSelect value={f.asset_id} onChange={(v) => set("asset_id", v)} /></Field>
      <Field label="Driver"><DriverSelect value={f.driver_id} onChange={(v) => set("driver_id", v)} /></Field>
      <Field label="Odometer at handover"><NumberInput value={f.checkout_odometer} onChange={(e) => set("checkout_odometer", e.target.value)} placeholder="km" /></Field>
      <Field label="Start date"><Input type="date" value={f.start_at} onChange={(e) => set("start_at", e.target.value)} /></Field>
      <div className="sm:col-span-2"><Field label="Condition notes"><Textarea rows={3} value={f.checkout_notes} onChange={(e) => set("checkout_notes", e.target.value)} placeholder="Fuel level, existing scratches, equipment handed over…" /></Field></div>
    </FormDialog>
  );
}

/* ---------------- Return (checkin) ---------------- */
export function ReturnAssignmentDialog({ assignmentId, label }: { assignmentId: string; label?: string }) {
  const d = useDialog();
  const ret = useReturnAssignment();
  const [f, setF] = useState({ checkin_odometer: "", checkin_notes: "" });

  return (
    <FormDialog
      open={d.open} onOpenChange={d.onOpenChange}
      trigger={<Button size="sm" variant="outline" className="gap-1.5"><RotateCcw className="h-4 w-4" />Return</Button>}
      title={label ? `Return — ${label}` : "Return vehicle"}
      submitLabel="Confirm return"
      pending={ret.isPending}
      onSubmit={async () => {
        try {
          await ret.mutateAsync({
            id: assignmentId,
            checkin_odometer: num(f.checkin_odometer),
            checkin_notes: f.checkin_notes || null,
          });
          toast.success("Vehicle returned");
          d.setOpen(false);
        } catch (e: any) { toast.error(e.message); }
      }}
    >
      <div className="sm:col-span-2"><Field label="Odometer at return"><NumberInput value={f.checkin_odometer} onChange={(e) => setF((p) => ({ ...p, checkin_odometer: e.target.value }))} placeholder="km" /></Field></div>
      <div className="sm:col-span-2"><Field label="Condition notes"><Textarea rows={3} value={f.checkin_notes} onChange={(e) => setF((p) => ({ ...p, checkin_notes: e.target.value }))} placeholder="New damage, fuel level, cleanliness…" /></Field></div>
    </FormDialog>
  );
}
