"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { busetaSchema, type BusetaInput } from "@/lib/schemas";
import { rowFingerprint } from "@/lib/utils";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BusetaEntry } from "@/lib/sheets";

interface BusetaRow extends BusetaEntry { rowIndex: number }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRow?: BusetaRow;
  onSuccess?: () => void;
}

const API = "/api/transactions/busetas";

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

function entryToFingerprint(e: BusetaEntry): string {
  return rowFingerprint([
    e.fecha, e.buseta, e.ruta, "", "",
    String(e.pasajeros), String(e.precioPasaje), String(e.brutoTotal),
    String(e.acpm), String(e.basico), String(e.varios),
    String(e.montajeLlanta), String(e.otros), String(e.totalGastos),
    String(e.netoTotal), e.nota,
  ]);
}

function NumberField({ label, name, register, error }: {
  label: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input type="number" inputMode="numeric" min="0" step="1" placeholder="0"
        {...register(name, { valueAsNumber: true })} />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export default function BusetaDrawer({ open, onOpenChange, editRow, onSuccess }: Props) {
  const isEdit = Boolean(editRow);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useForm<BusetaInput>({ resolver: zodResolver(busetaSchema) as any, defaultValues: { fecha: todayDDMMYYYY(), buseta: "", ruta: "", pasajeros: 0, precioPasaje: 0, brutoTotal: 0, acpm: 0, basico: 0, varios: 0, montajeLlanta: 0, otros: 0, totalGastos: 0, netoTotal: 0, nota: "" } });

  useEffect(() => {
    if (open && editRow) {
      reset({ fecha: editRow.fecha, buseta: editRow.buseta, ruta: editRow.ruta, pasajeros: editRow.pasajeros, precioPasaje: editRow.precioPasaje, brutoTotal: editRow.brutoTotal, acpm: editRow.acpm, basico: editRow.basico, varios: editRow.varios, montajeLlanta: editRow.montajeLlanta, otros: editRow.otros, totalGastos: editRow.totalGastos, netoTotal: editRow.netoTotal, nota: editRow.nota });
    } else if (open && !editRow) {
      reset({ fecha: todayDDMMYYYY(), buseta: "", ruta: "", pasajeros: 0, precioPasaje: 0, brutoTotal: 0, acpm: 0, basico: 0, varios: 0, montajeLlanta: 0, otros: 0, totalGastos: 0, netoTotal: 0, nota: "" });
    }
  }, [open, editRow, reset]);

  const fechaValue = watch("fecha");

  async function onSubmit(data: BusetaInput) {
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
      toast.success(isEdit ? "Registro actualizado" : "Registro agregado");
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
          <DrawerTitle>{isEdit ? "Editar viaje" : "Nuevo viaje"}</DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4 overflow-y-auto pb-2">
          {/* Identificación */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Fecha</label>
              <Input
                type="date"
                value={toInputDate(fechaValue)}
                onChange={(e) => setValue("fecha", fromInputDate(e.target.value), { shouldValidate: true })}
              />
              {errors.fecha && <p className="text-xs text-rose-400">{errors.fecha.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Buseta</label>
              <Input placeholder="Ej: Bus 01" {...register("buseta")} />
              {errors.buseta && <p className="text-xs text-rose-400">{errors.buseta.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Ruta</label>
            <Input placeholder="Opcional" {...register("ruta")} />
          </div>

          {/* Ingresos */}
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">Ingresos</p>
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Pasajeros" name="pasajeros" register={register} error={errors.pasajeros?.message} />
            <NumberField label="Precio pasaje" name="precioPasaje" register={register} />
            <NumberField label="Bruto total" name="brutoTotal" register={register} />
          </div>

          {/* Gastos */}
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">Gastos</p>
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="ACPM" name="acpm" register={register} />
            <NumberField label="Básico" name="basico" register={register} />
            <NumberField label="Varios" name="varios" register={register} />
            <NumberField label="Montaje llanta" name="montajeLlanta" register={register} />
            <NumberField label="Otros" name="otros" register={register} />
            <NumberField label="Total gastos" name="totalGastos" register={register} />
          </div>

          {/* Resultado */}
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-1">Resultado</p>
          <NumberField label="Neto total" name="netoTotal" register={register} />

          <div className="space-y-1">
            <label className="text-sm font-medium">Nota</label>
            <Input placeholder="Opcional" {...register("nota")} />
          </div>
        </form>

        <DrawerFooter>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar viaje"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full">
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
