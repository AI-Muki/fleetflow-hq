import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocuments, useDrivers, useMaintenance } from "@/lib/fleet-queries";
import { buildExpirations } from "@/lib/fleet-analytics";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — FleetFlow" },
      { name: "description", content: "Registrations, inspections, licences and scheduled services on one fleet calendar." },
      { property: "og:title", content: "Calendar — FleetFlow" },
      { property: "og:description", content: "Registrations, inspections, licences and scheduled services on one fleet calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const eventColor: Record<string, string> = {
  registration: "bg-primary/15 text-primary",
  insurance: "bg-success/15 text-success",
  inspection: "bg-info/15 text-info",
  license: "bg-destructive/15 text-destructive",
  service: "bg-warning/15 text-warning-foreground",
  other: "bg-muted text-muted-foreground",
};

function CalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => i - first + 1);

  const { data: docs = [] } = useDocuments();
  const { data: drivers = [] } = useDrivers();
  const { data: maint = [] } = useMaintenance();

  // Wide horizon so the whole visible month is covered, then bucket by day.
  const items = useMemo(() => buildExpirations(docs, drivers, maint, 400), [docs, drivers, maint]);

  const events = useMemo(() => {
    const map: Record<number, { type: string; text: string }[]> = {};
    for (const it of items) {
      const d = new Date(it.date);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const day = d.getDate();
      (map[day] ??= []).push({ type: it.kind, text: it.target });
    }
    return map;
  }, [items, year, month]);

  return (
    <>
      <PageHeader title="Calendar" subtitle={`${monthNames[month]} ${year} · Registrations, maintenance, inspections, licences`} />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="lg:col-span-3 p-4">
            <div className="grid grid-cols-7 text-xs font-medium text-muted-foreground border-b pb-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="px-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-px mt-1 bg-border rounded-lg overflow-hidden">
              {cells.map((d,i)=>{
                const inMonth = d>=1 && d<=daysInMonth;
                const today = inMonth && d===now.getDate();
                const evs = inMonth ? events[d] : undefined;
                return (
                  <div key={i} className={`min-h-[92px] bg-card p-1.5 ${!inMonth?"opacity-40":""}`}>
                    <div className={`text-xs ${today?"inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium":"text-muted-foreground"}`}>{inMonth?d:""}</div>
                    <div className="mt-1 space-y-1">
                      {evs?.slice(0, 3).map((e,j)=>(
                        <div key={j} className={`truncate rounded px-1.5 py-0.5 text-[10px] ${eventColor[e.type] ?? eventColor.other}`}>{e.text}</div>
                      ))}
                      {evs && evs.length > 3 && (
                        <div className="px-1.5 text-[10px] text-muted-foreground">+{evs.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <UpcomingList />
        </div>
      </PageBody>
    </>
  );
}

function UpcomingList() {
  const { data: docs = [] } = useDocuments();
  const { data: drivers = [] } = useDrivers();
  const { data: maint = [] } = useMaintenance();
  const items = useMemo(
    () => buildExpirations(docs, drivers, maint, 90).slice(0, 10),
    [docs, drivers, maint],
  );

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold">Upcoming</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">No upcoming events.</p>
      ) : (
        <ul className="mt-3 divide-y">
          {items.map((a) => (
            <li key={a.id} className="py-2.5">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={a.severity === "expired" || a.severity === "critical" ? "destructive" : "outline"}>{a.kind}</Badge>
                <span className="text-xs text-muted-foreground">
                  {a.days < 0 ? `${Math.abs(a.days)}d late` : a.days === 0 ? "today" : `in ${a.days}d`}
                </span>
              </div>
              <div className="mt-1 text-sm truncate">{a.target}</div>
              <div className="text-xs text-muted-foreground truncate">{a.label} · {a.date}</div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
