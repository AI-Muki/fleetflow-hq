import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export function QrLabelDialog({ asset }: { asset: { id: string; name: string; plate?: string | null } }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const url = `${window.location.origin}/assets/${asset.id}`;
    QRCode.toDataURL(url, { width: 512, margin: 2, errorCorrectionLevel: "M" })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [open, asset.id]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${asset.plate ?? asset.id.slice(0, 8)}.png`;
    a.click();
  };

  const print = () => {
    if (!dataUrl) return;
    const w = window.open("", "_blank", "width=420,height=560");
    if (!w) return;
    w.document.write(
      `<html><head><title>QR label — ${asset.name}</title></head><body style="font-family:sans-serif;text-align:center;padding:32px">` +
        `<img src="${dataUrl}" style="width:280px;height:280px" />` +
        `<h2 style="margin:16px 0 4px">${asset.name}</h2>` +
        `<p style="margin:0;color:#555">${asset.plate ?? ""}</p>` +
        `<script>window.onload=()=>{window.print();}<\/script></body></html>`,
    );
    w.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5"><QrCode className="h-4 w-4" />QR label</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>QR label</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Scanning this code opens the vehicle page. Print it and stick it on the vehicle.
        </p>
        <div className="mx-auto my-2 flex flex-col items-center gap-1 rounded-xl border bg-background p-4">
          {dataUrl ? (
            <img src={dataUrl} alt={`QR code for ${asset.name}`} className="h-48 w-48" />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center text-sm text-muted-foreground">Generating…</div>
          )}
          <div className="text-sm font-medium">{asset.name}</div>
          {asset.plate && <div className="font-mono text-xs text-muted-foreground">{asset.plate}</div>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={download} disabled={!dataUrl}>
            <Download className="h-4 w-4" />PNG
          </Button>
          <Button size="sm" className="gap-1.5" onClick={print} disabled={!dataUrl}>
            <Printer className="h-4 w-4" />Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
