import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Receipt, Loader2 } from "lucide-react";
import { useExpenses } from "@/lib/fleet-queries";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({ meta: [{ title: "Expenses — FleetFlow" }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { data: expenses = [], isLoading } = useExpenses();
  const total = expenses.reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0);

  return (
    <>
      <PageHeader title="Expenses" subtitle="Full cost breakdown per vehicle, driver and category." />
      <PageBody>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-4">
          <Card className="p-4"><div className="text-xs text-muted-foreground">Entries</div><div className="mt-1 text-2xl font-semibold tabular-nums">{expenses.length}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">Total</div><div className="mt-1 text-2xl font-semibold tabular-nums">€{total.toFixed(0)}</div></Card>
        </div>
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground"><Loader2 className="h-4 w-4 inline animate-spin mr-2" />Loading…</div>
        ) : expenses.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            <Receipt className="mx-auto h-8 w-8 mb-3" />
            No expenses recorded yet.
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e: any) => (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 tabular-nums">{e.expense_date ?? "—"}</td>
                    <td className="px-4 py-3">{e.category ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">€{Number(e.amount ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </PageBody>
    </>
  );
}
