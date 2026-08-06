import { ReactNode, useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAssets, useDrivers } from "@/lib/fleet-queries";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function AssetSelect({
  value, onChange, placeholder = "Select vehicle",
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { data: assets = [] } = useAssets();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {assets.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">No vehicles yet</div>
        ) : assets.map((a: any) => (
          <SelectItem key={a.id} value={a.id}>{a.name}{a.plate ? ` · ${a.plate}` : ""}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DriverSelect({
  value, onChange, placeholder = "Select driver",
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { data: drivers = [] } = useDrivers();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {drivers.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">No drivers yet</div>
        ) : drivers.map((d: any) => (
          <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function EnumSelect({
  value, onChange, options, placeholder,
}: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="capitalize">{o.replace(/_/g, " ")}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function NumberInput(props: React.ComponentProps<typeof Input>) {
  return <Input type="number" inputMode="decimal" {...props} />;
}

export function FormDialog({
  trigger, title, children, onSubmit, submitLabel = "Save", pending, canSubmit = true, open, onOpenChange,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  onSubmit: () => void | Promise<void>;
  submitLabel?: string;
  pending?: boolean;
  canSubmit?: boolean;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => { e.preventDefault(); void onSubmit(); }}
        >
          {children}
          <DialogFooter className="sm:col-span-2 mt-2">
            <Button type="submit" disabled={pending || !canSubmit} className="gap-1.5">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function useDialog() {
  const [open, setOpen] = useState(false);
  return { open, setOpen, onOpenChange: setOpen };
}

export const today = () => new Date().toISOString().slice(0, 10);
