"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BusetaEntry } from "@/lib/sheets";
import BusetasTable from "./BusetasTable";
import BusetaDrawer from "@/components/BusetaDrawer";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { rowFingerprint } from "@/lib/utils";
import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";
import { formatCOP } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/PaginationControls";

interface Props {
  entries: BusetaEntry[];
}

const API = "/api/transactions/busetas";

function entryFingerprint(e: BusetaEntry): string {
  return rowFingerprint([
    e.fecha, e.buseta, e.ruta, "", "",
    String(e.pasajeros), String(e.precioPasaje), String(e.brutoTotal),
    String(e.acpm), String(e.basico), String(e.varios),
    String(e.montajeLlanta), String(e.otros), String(e.totalGastos),
    String(e.netoTotal), e.nota,
  ]);
}

export default function BusetasCrud({ entries }: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRow, setEditRow] = useState<(BusetaEntry & { rowIndex: number }) | undefined>();
  const [deleteRow, setDeleteRow] = useState<BusetaEntry | undefined>();
  const [deleting, setDeleting] = useState(false);

  const { page, totalPages, paginated, goTo } = usePagination(entries, 15);

  function handleEdit(e: BusetaEntry) {
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
      toast.success("Registro eliminado");
      setDeleteRow(undefined);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Buseta</TableHead>
              <TableHead className="hidden sm:table-cell">Ruta</TableHead>
              <TableHead className="hidden md:table-cell text-right">Pasajeros</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Bruto</TableHead>
              <TableHead className="hidden md:table-cell text-right">ACPM</TableHead>
              <TableHead className="text-right">Gastos</TableHead>
              <TableHead className="text-right">Neto</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((e, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{e.fecha}</TableCell>
                <TableCell className="text-sm">{e.buseta}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{e.ruta}</TableCell>
                <TableCell className="hidden md:table-cell text-right font-mono text-sm">{e.pasajeros || "—"}</TableCell>
                <TableCell className="hidden sm:table-cell text-right font-mono text-xs">{e.brutoTotal > 0 ? formatCOP(e.brutoTotal) : "—"}</TableCell>
                <TableCell className="hidden md:table-cell text-right font-mono text-xs text-rose-400">{e.acpm > 0 ? formatCOP(e.acpm) : "—"}</TableCell>
                <TableCell className="text-right font-mono text-xs text-rose-400">{formatCOP(e.totalGastos)}</TableCell>
                <TableCell className={cn("text-right font-mono text-xs font-medium", e.netoTotal >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {formatCOP(e.netoTotal)}
                </TableCell>
                <TableCell className="p-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <FiMoreVertical size={14} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleEdit(e)}>
                        <FiEdit2 size={13} className="mr-2" />Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => setDeleteRow(e)}>
                        <FiTrash2 size={13} className="mr-2" />Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls page={page} totalPages={totalPages} onPage={goTo} totalItems={entries.length} pageSize={15} />

      <BusetaDrawer open={drawerOpen} onOpenChange={handleDrawerClose} editRow={editRow} onSuccess={() => router.refresh()} />

      <Dialog open={Boolean(deleteRow)} onOpenChange={(open) => { if (!open) setDeleteRow(undefined); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Eliminar registro</DialogTitle>
            <DialogDescription>
              ¿Eliminar viaje de {deleteRow?.buseta} del {deleteRow?.fecha}? Esta acción no se puede deshacer.
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
