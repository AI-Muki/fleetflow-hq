import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFleetSummary } from "@/lib/ai/fleet-summary.functions";
import { useCurrentCompanyId } from "@/hooks/use-company";

export function AiFleetSummary() {
  const companyId = useCurrentCompanyId();
  const run = useServerFn(getFleetSummary);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await run({ data: { companyId } });
      setSummary(res.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI summary failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> AI fleet summary
          </h3>
          <p className="text-xs text-muted-foreground">Status, urgent items, costs and recommendations.</p>
        </div>
        <Button size="sm" onClick={generate} disabled={loading || !companyId} className="gap-1.5">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {summary ? "Regenerate" : "Generate"}
        </Button>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {summary && <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{summary}</div>}
    </Card>
  );
}
