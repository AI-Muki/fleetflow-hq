import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { expensesByCategory, monthlyExpenses } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { KpiCard } from "@/components/kpi-card";
import { Receipt, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

export const Route = createFileRoute("/_app/expenses")({
  head: () => ({ meta: [{ title: "Expenses — FleetFlow" }] }),
  component: ExpensesPage,
});
const colors = ["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-3)","var(--color-chart-4)","var(--color-chart-5)","var(--color-primary)"];

function ExpensesPage() {
  const total = expensesByCategory.reduce((s,x)=>s+x.value,0);
  return (
    <>
      <PageHeader title="Expenses" subtitle="Full cost breakdown per vehicle, driver and category." />
      <PageBody>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-4">
          <KpiCard label="YTD spend" value={`€${(total/1000).toFixed(0)}k`} icon={Receipt} />
          <KpiCard label="This month" value="€48,250" icon={TrendingUp} delta={{value:"-4.2%", positive:true}} />
          <KpiCard label="Cost / vehicle / mo" value="€172" icon={PiggyBank} />
          <KpiCard label="Most expensive" value="MAN TGX" icon={TrendingDown} hint="ZG-131-EM · €8.4k" />
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-5">
            <h3 className="text-sm font-semibold">Monthly breakdown</h3>
            <div className="h-72 mt-3">
              <ResponsiveContainer>
                <BarChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" fontSize={11} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v)=>`€${(v/1000).toFixed(0)}k`}/>
                  <Tooltip contentStyle={{ background:"var(--color-popover)", border:"1px solid var(--color-border)", borderRadius:8, fontSize:12 }}/>
                  <Legend wrapperStyle={{ fontSize:11 }} iconType="circle"/>
                  <Bar dataKey="fuel" stackId="a" fill="var(--color-primary)" radius={[0,0,0,0]} />
                  <Bar dataKey="maintenance" stackId="a" fill="var(--color-chart-3)" />
                  <Bar dataKey="insurance" stackId="a" fill="var(--color-chart-2)" />
                  <Bar dataKey="other" stackId="a" fill="var(--color-chart-4)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold">By category</h3>
            <div className="h-72 mt-3">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={expensesByCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {expensesByCategory.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:"var(--color-popover)", border:"1px solid var(--color-border)", borderRadius:8, fontSize:12 }} formatter={(v: number) => `€${v.toLocaleString()}`}/>
                  <Legend wrapperStyle={{fontSize:11}} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
