import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { upcomingAlerts } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — FleetFlow" }] }),
  component: CalendarPage,
});

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function CalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({length: 42}, (_,i) => i - first + 1);

  const events: Record<number, {type: string; text: string}[]> = {
    5: [{type:"reg", text:"BE-142-AC"}],
    9: [{type:"maint", text:"Volvo FH16 service"}],
    12: [{type:"license", text:"M. Novak"}],
    17: [{type:"insp", text:"FL-129-CP"}, {type:"reg", text:"GR-108-BM"}],
    22: [{type:"maint", text:"MAN TGX 10k"}],
    28: [{type:"insurance", text:"3 vehicles"}],
  };
  const eventColor: Record<string,string> = {
    reg:"bg-primary/15 text-primary",
    maint:"bg-warning/15 text-warning-foreground",
    license:"bg-destructive/15 text-destructive",
    insp:"bg-info/15 text-info",
    insurance:"bg-success/15 text-success",
  };

  return (
    <>
      <PageHeader title="Calendar" subtitle={`${monthNames[month]} ${year} · Registrations, maintenance, inspections, assignments`} />
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
                      {evs?.map((e,j)=>(<div key={j} className={`truncate rounded px-1.5 py-0.5 text-[10px] ${eventColor[e.type]}`}>{e.text}</div>))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold">Upcoming</h3>
            <ul className="mt-3 divide-y">
              {upcomingAlerts.map((a,i)=>(
                <li key={i} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{a.type}</Badge>
                    <span className="text-xs text-muted-foreground">{a.when}</span>
                  </div>
                  <div className="mt-1 text-sm truncate">{a.target}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
