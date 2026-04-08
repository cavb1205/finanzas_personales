"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cajaTransactionSchema, type CajaTransactionInput } from "@/lib/schemas";
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
import type { Transaction } from "@/lib/sheets";

interface TransactionRow extends Transaction {
  rowIndex: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: "CLP" | "COP";
  apiPath: string;
  editRow?: TransactionRow;
  onSuccess?: () => void;
}

const CATEGORIES = ["Ingreso", "Gasto", "Préstamo", "Inversión"] as const;

/** Categories that go to the "ingreso" column; the rest go to "gasto" */
const INGRESO_CATS = new Set(["Ingreso", "Inversión"]);

/** Internal form shape: single "monto" field instead of ingreso+gasto */
const formSchema = z.object({
  fecha: z.string().min(1),
  categoria: z.enum(["Ingreso", "Gasto", "Préstamo", "Inversión"]),
  descripcion: z.string().min(1, "Descripción requerida").max(200),
  monto: z.number().positive("El monto debe ser mayor a 0"),
});
type FormValues = z.infer<typeof formSchema>;

function todayDDMMYYYY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Map a Transaction row (ingreso/gasto columns) to our single-monto form */
function txToForm(tx: Transaction): FormValues {
  return {
    fecha: tx.fecha,
    categoria: tx.categoria as FormValues["categoria"],
    descripcion: tx.descripcion,
    monto: tx.ingreso > 0 ? tx.ingreso : tx.gasto,
  };
}

/** Map form values back to the API payload shape (ingreso + gasto) */
function formToCajaPayload(data: FormValues): CajaTransactionInput {
  const isIngreso = INGRESO_CATS.has(data.categoria);
  return {
    fecha: data.fecha,
    categoria: data.categoria,
    descripcion: data.descripcion,
    ingreso: isIngreso ? data.monto : 0,
    gasto: isIngreso ? 0 : data.monto,
  };
}

export default function TransactionDrawer({
  open,
  onOpenChange,
  currency,
  apiPath,
  editRow,
  onSuccess,
}: Props) {
  const isEdit = Boolean(editRow);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      fecha: todayDDMMYYYY(),
      categoria: "Gasto",
      descripcion: "",
      monto: undefined,
    },
  });

  useEffect(() => {
    if (open && editRow) {
      reset(txToForm(editRow));
    } else if (open && !editRow) {
      reset({
        fecha: todayDDMMYYYY(),
        categoria: "Gasto",
        descripcion: "",
        monto: undefined,
      });
    }
  }, [open, editRow, reset]);

  const categoriaValue = watch("categoria");
  const currencyLabel = currency === "CLP" ? "CLP ($)" : "COP ($)";

  async function onSubmit(data: FormValues) {
    try {
      const payload = formToCajaPayload(data);
      let body: Record<string, unknown> = { ...payload };

      if (isEdit && editRow) {
        const original = [
          editRow.fecha,
          editRow.categoria,
          editRow.descripcion,
          editRow.ingreso > 0 ? String(editRow.ingreso) : "",
          editRow.gasto > 0 ? String(editRow.gasto) : "",
        ];
        body = {
          ...payload,
          rowIndex: editRow.rowIndex,
          fingerprint: rowFingerprint(original),
        };
      }

      const res = await fetch(apiPath, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.formErrors?.[0] ?? err?.error ?? "Error al guardar");
      }

      toast.success(isEdit ? "Transacción actualizada" : "Transacción agregada");
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
          <DrawerTitle>
            {isEdit ? "Editar transacción" : "Nueva transacción"}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4 overflow-y-auto">
          {/* Fecha */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha</label>
            <Input placeholder="DD/MM/YYYY" {...register("fecha")} />
            {errors.fecha && (
              <p className="text-xs text-rose-400">{errors.fecha.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Categoría</label>
            <Select
              value={categoriaValue}
              onValueChange={(v) =>
                setValue("categoria", v as FormValues["categoria"], { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria && (
              <p className="text-xs text-rose-400">{errors.categoria.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Descripción</label>
            <Input placeholder="Ej: Supermercado" {...register("descripcion")} />
            {errors.descripcion && (
              <p className="text-xs text-rose-400">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Monto único */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Monto ({currencyLabel})
            </label>
            <Input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              placeholder="0"
              {...register("monto", { valueAsNumber: true })}
            />
            {errors.monto && (
              <p className="text-xs text-rose-400">{errors.monto.message}</p>
            )}
          </div>
        </form>

        <DrawerFooter>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar transacción"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full"
          >
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
