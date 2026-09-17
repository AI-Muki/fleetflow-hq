import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Truck, Users, Wrench, FileText, Fuel, Receipt, LayoutDashboard, Calendar, BarChart3, ClipboardCheck, AlertTriangle } from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { useAssets, useDrivers, useDocuments, useMaintenance } from "@/lib/fleet-queries";

const PAGES = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Calendar", to: "/calendar", icon: Calendar },
  { title: "Assets", to: "/assets", icon: Truck },
  { title: "Drivers", to: "/drivers", icon: Users },
  { title: "Assignments", to: "/assignments", icon: ClipboardCheck },
  { title: "Maintenance", to: "/maintenance", icon: Wrench },
  { title: "Damage reports", to: "/damage-reports", icon: AlertTriangle },
  { title: "Fuel", to: "/fuel", icon: Fuel },
  { title: "Expenses", to: "/expenses", icon: Receipt },
  { title: "Documents", to: "/documents", icon: FileText },
  { title: "Reports", to: "/reports", icon: BarChart3 },
] as const;

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: assets = [] } = useAssets();
  const { data: drivers = [] } = useDrivers();
  const { data: docs = [] } = useDocuments();
  const { data: maint = [] } = useMaintenance();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const assetItems = useMemo(() => assets.slice(0, 50), [assets]);
  const driverItems = useMemo(() => drivers.slice(0, 50), [drivers]);
  const docItems = useMemo(() => docs.slice(0, 30), [docs]);
  const maintItems = useMemo(() => maint.slice(0, 30), [maint]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative ml-1 flex h-9 w-full max-w-xl items-center rounded-md border border-muted-foreground/10 bg-muted/40 pl-9 pr-16 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <span className="truncate">Search plate, VIN, driver, document…</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search vehicles, drivers, documents, services…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {assetItems.length > 0 && (
            <CommandGroup heading="Vehicles">
              {assetItems.map((a: any) => (
                <CommandItem
                  key={a.id}
                  value={`${a.name} ${a.plate ?? ""} ${a.vin ?? ""} ${a.make ?? ""} ${a.model ?? ""}`}
                  onSelect={() => go(() => navigate({ to: "/assets/$id", params: { id: a.id } }))}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{a.name}</span>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{a.plate ?? ""}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {driverItems.length > 0 && (
            <CommandGroup heading="Drivers">
              {driverItems.map((d: any) => (
                <CommandItem
                  key={d.id}
                  value={`${d.full_name} ${d.email ?? ""} ${d.phone ?? ""} ${d.license_number ?? ""}`}
                  onSelect={() => go(() => navigate({ to: "/drivers" }))}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{d.full_name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{d.email ?? d.phone ?? ""}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {docItems.length > 0 && (
            <CommandGroup heading="Documents">
              {docItems.map((d: any) => (
                <CommandItem
                  key={d.id}
                  value={`${d.name} ${d.kind} ${d.asset?.plate ?? ""} ${d.driver?.full_name ?? ""}`}
                  onSelect={() => go(() => navigate({ to: "/documents" }))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{d.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{d.expiry_date ?? d.kind}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {maintItems.length > 0 && (
            <CommandGroup heading="Maintenance">
              {maintItems.map((m: any) => (
                <CommandItem
                  key={m.id}
                  value={`${m.type} ${m.vendor ?? ""} ${m.description ?? ""} ${m.asset?.name ?? ""} ${m.asset?.plate ?? ""}`}
                  onSelect={() => go(() => navigate({ to: "/maintenance" }))}
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{m.asset?.name ?? "Vehicle"} · {m.type}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{m.scheduled_date ?? ""}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading="Go to">
            {PAGES.map((p) => (
              <CommandItem key={p.to} value={`page ${p.title}`} onSelect={() => go(() => navigate({ to: p.to }))}>
                <p.icon className="mr-2 h-4 w-4" />
                {p.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
