import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { parseCSVObjects } from "@/lib/csv";

export type CsvColumn = {
  key: string;
  label: string;
  required?: boolean;
  map: (raw: string) => Record<string, unknown>;
};

type Props<T> = {
  label: string;
  columns: CsvColumn[];
  example: string;
  onInsert: (rows: T[]) => Promise<void>;
};

export function CsvImportDialog<T extends Record<string, unknown>>({ label, columns, example, onInsert }: Props<T>) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<T[] | null>(null);
  const [skipped, setSkipped] = useState(0);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRows(null);
    setSkipped(0);
    if (ref.current) ref.current.value = "";
  };

  const handleFile = async (file: File) => {
    const objs = parseCSVObjects(await file.text());
    const parsed: T[] = [];
    let bad = 0;
    for (const o of objs) {
      const row: Record<string, unknown> = {};
      let missing = false;
      for (const col of columns) {
        const raw = o[col.key] ?? "";
        if (col.required && !raw) {
          missing = true;
          break;
        }
        Object.assign(row, col.map(raw));
      }
      if (missing) bad++;
      else parsed.push(row as T);
    }
    if (parsed.length === 0) {
      toast.error("No valid rows found — check the column names match the example");
      return;
    }
    setRows(parsed);
    setSkipped(bad);
  };

  const confirm = async () => {
    if (!rows) return;
    setBusy(true);
    try {
      await onInsert(rows);
      toast.success(`Imported ${rows.length} ${label}`);
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5"><Upload className="h-4 w-4" />Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Import {label} from CSV</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            First row must be the header. Expected columns:{" "}
            <span className="font-mono text-xs">{columns.map((c) => c.key).join(", ")}</span>
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-xs">{example}</pre>
          <input
            ref={ref}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          {!rows ? (
            <Button variant="outline" className="w-full gap-2" onClick={() => ref.current?.click()}>
              <Upload className="h-4 w-4" />Choose CSV file
            </Button>
          ) : (
            <>
              <div className="max-h-48 overflow-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40">
                    <tr>
                      {columns.slice(0, 4).map((c) => (
                        <th key={c.key} className="px-3 py-2 text-left font-medium">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 8).map((r, i) => (
                      <tr key={i} className="border-t">
                        {columns.slice(0, 4).map((c) => (
                          <td key={c.key} className="px-3 py-1.5">{String((r as Record<string, unknown>)[c.key] ?? "—")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                {rows.length} rows ready{rows.length > 8 ? ` (showing first 8)` : ""}
                {skipped > 0 ? ` · ${skipped} skipped (missing required fields)` : ""}
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={reset}>Back</Button>
                <Button size="sm" onClick={confirm} disabled={busy}>
                  {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Import {rows.length} {label}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
