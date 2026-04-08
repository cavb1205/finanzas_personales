"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TransactionTable from "@/components/TransactionTable";
import TransactionDrawer from "@/components/TransactionDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ExportCsvButton from "@/components/ExportCsvButton";
import type { Transaction } from "@/lib/sheets";
import { rowFingerprint } from "@/lib/utils";

interface Props {
  transactions: Transaction[];
}

const API = "/api/transactions/caja-colombia";

function txFingerprint(t: Transaction): string {
  return rowFingerprint([
    t.fecha,
    t.categoria,
    t.descripcion,
    t.ingreso > 0 ? String(t.ingreso) : "",
    t.gasto > 0 ? String(t.gasto) : "",
  ]);
}

export default function CajaColombiaGrud({ transactions }: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [deleteTx, setDeleteTx] = useState<Transaction | undefined>();
  const [deleting, setDeleting] = useState(false);

  function handleEdit(tx: Transaction) {
    setEditTx(tx);
    setDrawerOpen(true);
  }

  function handleDrawerClose(open: boolean) {
    setDrawerOpen(open);
    if (!open) setEditTx(undefined);
  }

  async function handleDelete() {
    if (!deleteTx || deleteTx.rowIndex === undefined) return;
    setDeleting(true);
    try {
      const res = await fetch(API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex: deleteTx.rowIndex,
          fingerprint: txFingerprint(deleteTx),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Error al eliminar");
      }
      toast.success("Transacción eliminada");
      setDeleteTx(undefined);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Transacciones</h2>
        <ExportCsvButton transactions={transactions} filename="caja-colombia" />
      </div>

      <TransactionTable
        transactions={transactions}
        currency="COP"
        onEdit={handleEdit}
        onDelete={(tx) => setDeleteTx(tx)}
      />

      <TransactionDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
        currency="COP"
        apiPath={API}
        editRow={editTx ? { ...editTx, rowIndex: editTx.rowIndex ?? 0 } : undefined}
        onSuccess={() => router.refresh()}
      />

      <Dialog open={Boolean(deleteTx)} onOpenChange={(open) => { if (!open) setDeleteTx(undefined); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Eliminar transacción</DialogTitle>
            <DialogDescription>
              ¿Eliminar &ldquo;{deleteTx?.descripcion}&rdquo;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTx(undefined)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
