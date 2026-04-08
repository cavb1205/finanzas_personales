"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { portafolioSchema, type PortafolioInput } from "@/lib/schemas";
import { rowFingerprint } from "@/lib/utils";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { InvestmentEntry } from "@/lib/sheets";

interface PortafolioRow extends InvestmentEntry { rowIndex: number }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRow?: PortafolioRow;
  onSuccess?: () => void;
}

const API = "/api/transactions/portafolio";
const ETFS = ["GOOG", "BTC"] as const;

function todayDDMMYYYY(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function toInputDate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  if (!dd || !mm || !yyyy) return "";
  return `${yyyy}-${mm}-${dd}`;
}

function fromInputDate(yyyymmdd: string): string {
  const [yyyy, mm, dd] = yyyymmdd.split("-");
  if (!dd || !mm || !yyyy) return "";
  return `${dd}/${mm}/${yyyy}`;
}

function entryToFingerprint(e: InvestmentEntry): string {
  return rowFingerprint([
    e.etf, e.nombre, e.fechaCompra,
    String(e.cantidad), String(e.precioCompra), String(e.inversionInicial),
  ]);
}

export default function PortafolioDrawer({ open, onOpenChange, editRow, onSuccess }: Props) {
  const isEdit = Boolean(editRow);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useForm<PortafolioInput>({ resolver: zodResolver(portafolioSchema) as any, defaultValues: { etf: "GOOG", nombre: "", fechaCompra: todayDDMMYYYY(), cantidad: undefined, precioCompra: undefined, inversionInicial: undefined } });

  useEffect(() => {
    if (open && editRow) {
      reset({ etf: editRow.etf as PortafolioInput["etf"], nombre: editRow.nombre, fechaCompra: editRow.fechaCompra, cantidad: editRow.cantidad, precioCompra: editRow.precioCompra, inversionInicial: editRow.inversionInicial });
    } else if (open && !editRow) {
      reset({ etf: "GOOG", nombre: "", fechaCompra: todayDDMMYYYY(), cantidad: undefined, precioCompra: undefined, inversionInicial: undefined });
    }
  }, [open, editRow, reset]);

  const etfValue = watch("etf");
  const fechaCompraValue = watch("fechaCompra");

  async function onSubmit(data: PortafolioInput) {
    try {
      let body: Record<string, unknown> = { ...data };
      if (isEdit && editRow) {
        body = { ...data, rowIndex: editRow.rowIndex, fingerprint: entryToFingerprint(editRow) };
      }
      const res = await fetch(API, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Error al guardar");
      }
      toast.success(isEdit ? "Posición actualizada" : "Posición agregada");
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error desconocido");
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEdit ? "Editar posición" : "Nueva posición"}</DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4 overflow-y-auto pb-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Activo</label>
              <Select value={etfValue} onValueChange={(v) => { if (v) setValue("etf", v as PortafolioInput["etf"], { shouldValidate: true }); }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ETFS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.etf && <p className="text-xs text-rose-400">{errors.etf.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Fecha compra</label>
              <Input
                type="date"
                value={toInputDate(fechaCompraValue)}
                onChange={(e) => setValue("fechaCompra", fromInputDate(e.target.value), { shouldValidate: true })}
              />
              {errors.fechaCompra && <p className="text-xs text-rose-400">{errors.fechaCompra.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre / descripción</label>
            <Input placeholder="Ej: Compra Google Q1" {...register("nombre")} />
            {errors.nombre && <p className="text-xs text-rose-400">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Cantidad</label>
              <Input type="number" inputMode="decimal" min="0" step="any" placeholder="0.00"
                {...register("cantidad", { valueAsNumber: true })} />
              {errors.cantidad && <p className="text-xs text-rose-400">{errors.cantidad.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Precio compra (USD)</label>
              <Input type="number" inputMode="decimal" min="0" step="any" placeholder="0.00"
                {...register("precioCompra", { valueAsNumber: true })} />
              {errors.precioCompra && <p className="text-xs text-rose-400">{errors.precioCompra.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Inversión (USD)</label>
              <Input type="number" inputMode="decimal" min="0" step="any" placeholder="0.00"
                {...register("inversionInicial", { valueAsNumber: true })} />
              {errors.inversionInicial && <p className="text-xs text-rose-400">{errors.inversionInicial.message}</p>}
            </div>
          </div>
        </form>

        <DrawerFooter>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar posición"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full">
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
