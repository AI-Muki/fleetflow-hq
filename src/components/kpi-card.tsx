import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success" ? "text-success"
    : tone === "warning" ? "text-warning"
    : tone === "danger" ? "text-destructive"
    : "text-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="kpi-card p-4"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={`mt-3 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {delta && (
          <span className={`inline-flex items-center gap-0.5 ${delta.positive ? "text-success" : "text-destructive"}`}>
            {delta.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta.value}
          </span>
        )}
        {hint && <span>{hint}</span>}
      </div>
    </motion.div>
  );
}
