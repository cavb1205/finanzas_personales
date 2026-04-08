"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Prestamo, PrestamoResumen } from "@/lib/sheets";
import { formatCOP } from "@/lib/format";
import PrestamoDrawer from "@/components/PrestamoDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { rowFingerprint } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";

interface Props {
  movimientos: Prestamo[];
  resumen: PrestamoResumen[];
}

const API = "/api/transactions/prestamos";

function prestamoFingerprint(m: Prestamo): string {
  return rowFingerprint([
    m.fecha,
    m.persona,
    m.operacion,
    String(m.monto),
    m.moneda,
    m.observaciones,
  ]);
}

export default function PrestamosCrud({ movimientos, resumen }: Props) {
  const router = useRouter();
  const personas = useMemo(
    () => ["all", ...resumen.map((r) => r.persona).filter(Boolean)],
    [resumen]
  );
  const [persona, setPersona] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRow, setEditRow] = useState<(Prestamo & { rowIndex: number }) | undefined>();
  const [deleteRow, setDeleteRow] = useState<Prestamo | undefined>();
  const [deleting, setDeleting] = useState(false);

  const filtrados = useMemo(
    () => persona === "all" ? movimientos : movimientos.filter((m) => m.persona === persona),
    [movimientos, persona]
  );

  function handleEdit(m: Prestamo) {
    if (m.rowIndex === undefined) return;
    setEditRow({ ...m, rowIndex: m.rowIndex });
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
        body: JSON.stringify({
          rowIndex: deleteRow.rowIndex,
          fingerprint: prestamoFingerprint(deleteRow),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Error al eliminar");
      }
      toast.success("Movimiento eliminado");
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
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">Historial completo</h2>
        <Select value={persona} onValueChange={(v) => { if (v) setPersona(v); }}>
          <SelectTrigger className="w-full sm:w-44 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las personas</SelectItem>
            {personas.slice(1).map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtrados.length} movimiento{filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Fecha</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Operación</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="hidden lg:table-cell">Notas</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-0">
                  <EmptyState title="Sin movimientos" description="No hay movimientos para esta persona." />
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((m, i) => {
                const esPrestamo =
                  m.operacion.includes("PRÉSTAMO") || m.operacion.includes("PRESTAMO");
                return (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {m.fecha}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{m.persona}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs whitespace-nowrap",
                          esPrestamo
                            ? "border-rose-500/30 text-rose-400"
                            : "border-emerald-500/30 text-emerald-400"
                        )}
                      >
                        {m.operacion}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-mono text-xs font-semibold whitespace-nowrap",
                      esPrestamo ? "text-rose-400" : "text-emerald-400"
                    )}>
                      {esPrestamo ? "-" : "+"}{formatCOP(m.monto)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {m.observaciones}
                    </TableCell>
                    <TableCell className="p-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <FiMoreVertical size={14} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEdit(m)}>
                            <FiEdit2 size={13} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteRow(m)}>
                            <FiTrash2 size={13} className="mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PrestamoDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
        editRow={editRow}
        onSuccess={() => router.refresh()}
      />

      <Dialog open={Boolean(deleteRow)} onOpenChange={(open) => { if (!open) setDeleteRow(undefined); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Eliminar movimiento</DialogTitle>
            <DialogDescription>
              ¿Eliminar {deleteRow?.operacion} de {deleteRow?.persona} por {deleteRow ? formatCOP(deleteRow.monto) : ""}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRow(undefined)} disabled={deleting}>
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
