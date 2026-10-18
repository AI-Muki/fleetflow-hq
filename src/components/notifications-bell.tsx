import { Bell, AlertTriangle, Clock, CalendarClock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocuments, useDrivers, useMaintenance } from "@/lib/fleet-queries";
import { buildExpirations, type ExpiryItem } from "@/lib/fleet-analytics";

function iconFor(severity: ExpiryItem["severity"]) {
  if (severity === "expired") return <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />;
  if (severity === "critical") return <Clock className="h-4 w-4 text-warning shrink-0" />;
  return <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function whenLabel(days: number) {
  if (days < 0) return `${-days} d late`;
  if (days === 0) return "Due today";
  return `In ${days} d`;
}

export function NotificationsBell() {
  const { data: docs = [] } = useDocuments();
  const { data: drivers = [] } = useDrivers();
  const { data: maintenance = [] } = useMaintenance();
  const navigate = useNavigate();

  const items = buildExpirations(docs as any[], drivers as any[], maintenance as any[], 30)
    .filter((i) => i.severity !== "ok")
    .slice(0, 12);
  const urgent = items.filter((i) => i.severity === "expired" || i.severity === "critical").length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {urgent > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {urgent > 9 ? "9+" : urgent}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nothing urgent — no expiring documents or overdue service.
          </div>
        ) : (
          items.map((i) => (
            <DropdownMenuItem
              key={i.id}
              className="flex items-start gap-2.5 py-2"
              onClick={() => navigate({ to: i.id.startsWith("svc-") ? "/maintenance" : "/documents" })}
            >
              {iconFor(i.severity)}
              <span className="flex-1 min-w-0">
                <span className="block truncate text-sm">{i.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{i.target}</span>
              </span>
              <span className={`text-xs shrink-0 ${i.severity === "expired" ? "text-destructive" : "text-muted-foreground"}`}>
                {whenLabel(i.days)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
