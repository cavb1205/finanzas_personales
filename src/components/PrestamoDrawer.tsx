"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { prestamoSchema, type PrestamoInput } from "@/lib/schemas";
import { rowFingerprint } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Prestamo } from "@/lib/sheets";

interface PrestamoRow extends Prestamo {
  rowIndex: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRow?: PrestamoRow;
  onSuccess?: () => void;
}

const MONEDAS = ["COP", "CLP", "USD"] as const;
const API = "/api/transactions/prestamos";

const OPERACIONES_PRESTAMO = ["PRÉSTAMO", "ABONO", "PAGO TOTAL"] as const;

function todayDDMMYYYY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
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

export default function PrestamoDrawer({ open, onOpenChange, editRow, onSuccess }: Props) {
  const isEdit = Boolean(editRow);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PrestamoInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(prestamoSchema) as any,
    defaultValues: {
      fecha: todayDDMMYYYY(),
      persona: "",
      operacion: "PRÉSTAMO",
      monto: undefined,
      moneda: "COP",
      observaciones: "",
    },
  });

  useEffect(() => {
    if (open && editRow) {
      reset({
        fecha: editRow.fecha,
        persona: editRow.persona,
        operacion: editRow.operacion,
        monto: editRow.monto,
        moneda: editRow.moneda as PrestamoInput["moneda"],
        observaciones: editRow.observaciones,
      });
    } else if (open && !editRow) {
      reset({
        fecha: todayDDMMYYYY(),
        persona: "",
        operacion: "PRÉSTAMO",
        monto: 0,
        moneda: "COP",
        observaciones: "",
      });
    }
  }, [open, editRow, reset]);

  const monedaValue = watch("moneda");
  const fechaValue = watch("fecha");

  async function onSubmit(data: PrestamoInput) {
    try {
      let body: Record<string, unknown> = { ...data };

      if (isEdit && editRow) {
        const original = [
          editRow.fecha,
          editRow.persona,
          editRow.operacion,
          String(editRow.monto),
          editRow.moneda,
          editRow.observaciones,
        ];
        body = {
          ...data,
          rowIndex: editRow.rowIndex,
          fingerprint: rowFingerprint(original),
        };
      }

      const res = await fetch(API, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.formErrors?.[0] ?? err?.error ?? "Error al guardar");
      }

      toast.success(isEdit ? "Préstamo actualizado" : "Préstamo registrado");
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
          <DrawerTitle>{isEdit ? "Editar préstamo" : "Nuevo préstamo"}</DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4 overflow-y-auto">
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
            <label className="text-sm font-medium">Persona</label>
            <Input placeholder="Ej: Juan" {...register("persona")} />
            {errors.persona && <p className="text-xs text-rose-400">{errors.persona.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Operación</label>
            <Select
              value={watch("operacion")}
              onValueChange={(v) => { if (v) setValue("operacion", v, { shouldValidate: true }); }}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {OPERACIONES_PRESTAMO.map((op) => <SelectItem key={op} value={op}>{op}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.operacion && <p className="text-xs text-rose-400">{errors.operacion.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Monto</label>
              <Input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                placeholder="0"
                {...register("monto", { valueAsNumber: true })}
              />
              {errors.monto && <p className="text-xs text-rose-400">{errors.monto.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Moneda</label>
              <Select
                value={monedaValue}
                onValueChange={(v) => setValue("moneda", v as PrestamoInput["moneda"], { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONEDAS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Observaciones</label>
            <Input placeholder="Opcional" {...register("observaciones")} />
          </div>
        </form>

        <DrawerFooter>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar préstamo"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full">
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
