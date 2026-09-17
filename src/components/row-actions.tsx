import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteRow, type DeletableTable } from "@/lib/fleet-queries";

export function DeleteButton({
  table,
  id,
  label,
  size = "icon",
}: {
  table: DeletableTable;
  id: string;
  label: string;
  size?: "icon" | "sm";
}) {
  const [open, setOpen] = useState(false);
  const del = useDeleteRow(table);

  const confirm = async () => {
    try {
      await del.mutateAsync(id);
      toast.success("Deleted");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size={size === "icon" ? "icon" : "sm"}
        aria-label={`Delete ${label}`}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the record. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirm(); }}
              disabled={del.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {del.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
