import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { scanReceipt, type ReceiptData } from "@/lib/ai/receipt-scan.functions";

async function toDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function ReceiptScanButton({ onResult }: { onResult: (r: ReceiptData) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const run = useServerFn(scanReceipt);
  const [busy, setBusy] = useState(false);

  return (
    <div className="sm:col-span-2">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            const r = await run({ data: { image: await toDataUrl(file) } });
            onResult(r);
            toast.success("Receipt read — check the fields before saving");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not read the receipt");
          } finally {
            setBusy(false);
          }
        }}
      />
      <Button type="button" variant="outline" className="w-full gap-2" disabled={busy} onClick={() => ref.current?.click()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
        {busy ? "Reading receipt…" : "Scan receipt with AI"}
      </Button>
    </div>
  );
}
