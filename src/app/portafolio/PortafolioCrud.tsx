"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { InvestmentEntry } from "@/lib/sheets";
import PortafolioTable from "./PortafolioTable";
import PortafolioDrawer from "@/components/PortafolioDrawer";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { rowFingerprint } from "@/lib/utils";
import { formatUSD } from "@/lib/format";

interface Props {
  entries: InvestmentEntry[];
}

const API = "/api/transactions/portafolio";

function entryFingerprint(e: InvestmentEntry): string {
  return rowFingerprint([
    e.etf, e.nombre, e.fechaCompra,
    String(e.cantidad), String(e.precioCompra), String(e.inversionInicial),
  ]);
}

export default function PortafolioCrud({ entries }: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRow, setEditRow] = useState<(InvestmentEntry & { rowIndex: number }) | undefined>();
  const [deleteRow, setDeleteRow] = useState<InvestmentEntry | undefined>();
  const [deleting, setDeleting] = useState(false);

  function handleEdit(e: InvestmentEntry) {
    if (e.rowIndex === undefined) return;
    setEditRow({ ...e, rowIndex: e.rowIndex });
    setDrawerOpen(true);
  }

  function handleDrawerClose(open: boolean) {
    setDrawerOpen(open);
    if (!open) setEditRow(undefined);
  }

  async function handleDelete() {
    if (!deleteRow || deleteRow.rowIndex === undefined) return;
    setDeleting(true);
    try {
      const res = await fetch(API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex: deleteRow.rowIndex, fingerprint: entryFingerprint(deleteRow) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Error al eliminar");
      }
      toast.success("Posición eliminada");
      setDeleteRow(undefined);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Posiciones</h2>

      <PortafolioTable
        entries={entries}
        onEdit={handleEdit}
        onDelete={(e) => setDeleteRow(e)}
      />

      <PortafolioDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
        editRow={editRow}
        onSuccess={() => router.refresh()}
      />

      <Dialog open={Boolean(deleteRow)} onOpenChange={(open) => { if (!open) setDeleteRow(undefined); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Eliminar posición</DialogTitle>
            <DialogDescription>
              ¿Eliminar {deleteRow?.etf} comprado el {deleteRow?.fechaCompra} ({deleteRow ? formatUSD(deleteRow.inversionInicial) : ""})? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRow(undefined)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
