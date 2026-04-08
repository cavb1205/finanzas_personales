"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { prestamoSchema, busetaSchema, portafolioSchema, type PrestamoInput, type BusetaInput, type PortafolioInput } from "@/lib/schemas";
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
import {
  FiDollarSign,
  FiGlobe,
  FiUsers,
  FiTruck,
  FiTrendingUp,
  FiChevronLeft,
} from "react-icons/fi";

// ---------------------------------------------------------------------------
// Module definitions
// ---------------------------------------------------------------------------

type ModuleId = "caja-chile" | "caja-colombia" | "prestamos" | "busetas" | "portafolio";

const MODULES: { id: ModuleId; label: string; sublabel: string; icon: React.ReactNode; color: string }[] = [
  {
    id: "caja-chile",
    label: "Caja Chile",
    sublabel: "Ingresos y gastos CLP",
    icon: <FiDollarSign size={20} />,
    color: "text-blue-400 bg-blue-500/10",
  },
  {
    id: "caja-colombia",
    label: "Caja Colombia",
    sublabel: "Ingresos y gastos COP",
    icon: <FiGlobe size={20} />,
    color: "text-emerald-400 bg-emerald-500/10",
  },
  {
    id: "prestamos",
    label: "Préstamos",
    sublabel: "Registrar préstamo o abono",
    icon: <FiUsers size={20} />,
    color: "text-amber-400 bg-amber-500/10",
  },
  {
    id: "busetas",
    label: "Busetas",
    sublabel: "Registrar viaje del día",
    icon: <FiTruck size={20} />,
    color: "text-indigo-400 bg-indigo-500/10",
  },
  {
    id: "portafolio",
    label: "Portafolio",
    sublabel: "Nueva posición de inversión",
    icon: <FiTrendingUp size={20} />,
    color: "text-violet-400 bg-violet-500/10",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CAJA_CHILE_CATEGORIES = ["Ingreso", "Gasto", "Préstamo", "Inversión"] as const;
const CAJA_COLOMBIA_CATEGORIES = ["Ingreso", "Gasto", "Préstamo", "Inversión", "Remesa"] as const;
const INGRESO_CATS = new Set(["Ingreso", "Inversión", "Remesa"]);
const MONEDAS = ["COP", "CLP", "USD"] as const;
const OPERACIONES_PRESTAMO = ["PRÉSTAMO", "ABONO", "PAGO TOTAL"] as const;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const cajaChileFormSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  categoria: z.enum(["Ingreso", "Gasto", "Préstamo", "Inversión"]),
  descripcion: z.string().min(1, "Descripción requerida").max(200),
  monto: z.number().positive("Debe ser mayor a 0"),
});

const cajaColombiaFormSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  categoria: z.enum(["Ingreso", "Gasto", "Préstamo", "Inversión", "Remesa"]),
  descripcion: z.string().min(1, "Descripción requerida").max(200),
  monto: z.number().positive("Debe ser mayor a 0"),
});

type CajaChileFormValues = z.infer<typeof cajaChileFormSchema>;
type CajaColombiaFormValues = z.infer<typeof cajaColombiaFormSchema>;

function todayDDMMYYYY(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// CajaChile form
// ---------------------------------------------------------------------------

function CajaChileForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: CajaChileFormValues) => Promise<void>;
  isSubmitting: boolean;
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useForm<CajaChileFormValues>({ resolver: zodResolver(cajaChileFormSchema) as any, defaultValues: { fecha: todayDDMMYYYY(), categoria: "Gasto", descripcion: "" } });

  const cat = watch("categoria");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Fecha</label>
        <Input placeholder="DD/MM/YYYY" {...register("fecha")} />
        {errors.fecha && <p className="text-xs text-rose-400">{errors.fecha.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Categoría</label>
        <Select value={cat} onValueChange={(v) => setValue("categoria", v as CajaChileFormValues["categoria"], { shouldValidate: true })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CAJA_CHILE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.categoria && <p className="text-xs text-rose-400">{errors.categoria.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Descripción</label>
        <Input placeholder="Ej: Supermercado" {...register("descripcion")} />
        {errors.descripcion && <p className="text-xs text-rose-400">{errors.descripcion.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Monto (CLP $)</label>
        <Input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          placeholder="0"
          {...register("monto", { valueAsNumber: true })}
        />
        {errors.monto && <p className="text-xs text-rose-400">{errors.monto.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : "Agregar transacción"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// CajaColom form
// ---------------------------------------------------------------------------

function CajaColombiaForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: CajaColombiaFormValues) => Promise<void>;
  isSubmitting: boolean;
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useForm<CajaColombiaFormValues>({ resolver: zodResolver(cajaColombiaFormSchema) as any, defaultValues: { fecha: todayDDMMYYYY(), categoria: "Gasto", descripcion: "" } });

  const cat = watch("categoria");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Fecha</label>
        <Input placeholder="DD/MM/YYYY" {...register("fecha")} />
        {errors.fecha && <p className="text-xs text-rose-400">{errors.fecha.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Categoría</label>
        <Select value={cat} onValueChange={(v) => setValue("categoria", v as CajaColombiaFormValues["categoria"], { shouldValidate: true })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CAJA_COLOMBIA_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.categoria && <p className="text-xs text-rose-400">{errors.categoria.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Descripción</label>
        <Input placeholder="Ej: Mercado" {...register("descripcion")} />
        {errors.descripcion && <p className="text-xs text-rose-400">{errors.descripcion.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Monto (COP $)</label>
        <Input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          placeholder="0"
          {...register("monto", { valueAsNumber: true })}
        />
        {errors.monto && <p className="text-xs text-rose-400">{errors.monto.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : "Agregar transacción"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Prestamo form
// ---------------------------------------------------------------------------

function PrestamoForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: PrestamoInput) => Promise<void>;
  isSubmitting: boolean;
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useForm<PrestamoInput>({ resolver: zodResolver(prestamoSchema) as any, defaultValues: { fecha: todayDDMMYYYY(), persona: "", operacion: "PRÉSTAMO", monto: undefined, moneda: "COP", observaciones: "" } });

  const moneda = watch("moneda");
  const operacion = watch("operacion");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Fecha</label>
        <Input placeholder="DD/MM/YYYY" {...register("fecha")} />
        {errors.fecha && <p className="text-xs text-rose-400">{errors.fecha.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Persona</label>
        <Input placeholder="Ej: Juan" {...register("persona")} />
        {errors.persona && <p className="text-xs text-rose-400">{errors.persona.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Operación</label>
        <Select value={operacion} onValueChange={(v) => { if (v) setValue("operacion", v, { shouldValidate: true }); }}>
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
            min="1"
            step="1"
            placeholder="0"
            {...register("monto", { valueAsNumber: true })}
          />
          {errors.monto && <p className="text-xs text-rose-400">{errors.monto.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Moneda</label>
          <Select value={moneda} onValueChange={(v) => setValue("moneda", v as PrestamoInput["moneda"])}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONEDAS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Observaciones</label>
        <Input placeholder="Opcional" {...register("observaciones")} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : "Registrar préstamo"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Buseta form
// ---------------------------------------------------------------------------

const BUSETA_FIELDS: { name: keyof BusetaInput; label: string }[] = [
  { name: "pasajeros", label: "Pasajeros" },
  { name: "precioPasaje", label: "Precio pasaje" },
  { name: "brutoTotal", label: "Bruto total" },
  { name: "acpm", label: "ACPM" },
  { name: "basico", label: "Básico" },
  { name: "varios", label: "Varios" },
  { name: "montajeLlanta", label: "Montaje llanta" },
  { name: "otros", label: "Otros" },
  { name: "totalGastos", label: "Total gastos" },
  { name: "netoTotal", label: "Neto total" },
];

function BusetaForm({ onSubmit, isSubmitting }: { onSubmit: (d: BusetaInput) => Promise<void>; isSubmitting: boolean }) {
  const { register, handleSubmit, formState: { errors } } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useForm<BusetaInput>({ resolver: zodResolver(busetaSchema) as any, defaultValues: { fecha: todayDDMMYYYY(), buseta: "", ruta: "", pasajeros: 0, precioPasaje: 0, brutoTotal: 0, acpm: 0, basico: 0, varios: 0, montajeLlanta: 0, otros: 0, totalGastos: 0, netoTotal: 0, nota: "" } });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha</label>
          <Input placeholder="DD/MM/YYYY" {...register("fecha")} />
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
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ingresos</p>
      <div className="grid grid-cols-3 gap-3">
        {BUSETA_FIELDS.slice(0, 3).map(({ name, label }) => (
          <div key={name} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <Input type="number" inputMode="numeric" min="0" step="1" placeholder="0" {...register(name, { valueAsNumber: true })} />
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gastos</p>
      <div className="grid grid-cols-3 gap-3">
        {BUSETA_FIELDS.slice(3, 9).map(({ name, label }) => (
          <div key={name} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <Input type="number" inputMode="numeric" min="0" step="1" placeholder="0" {...register(name, { valueAsNumber: true })} />
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Neto total</label>
        <Input type="number" inputMode="numeric" step="1" placeholder="0" {...register("netoTotal", { valueAsNumber: true })} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Nota</label>
        <Input placeholder="Opcional" {...register("nota")} />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : "Registrar viaje"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Portafolio form
// ---------------------------------------------------------------------------

function PortafolioForm({ onSubmit, isSubmitting }: { onSubmit: (d: PortafolioInput) => Promise<void>; isSubmitting: boolean }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useForm<PortafolioInput>({ resolver: zodResolver(portafolioSchema) as any, defaultValues: { etf: "GOOG", nombre: "", fechaCompra: todayDDMMYYYY(), cantidad: undefined, precioCompra: undefined, inversionInicial: undefined } });

  const etf = watch("etf");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Activo</label>
          <Select value={etf} onValueChange={(v) => { if (v) setValue("etf", v as PortafolioInput["etf"], { shouldValidate: true }); }}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="GOOG">GOOG</SelectItem>
              <SelectItem value="BTC">BTC</SelectItem>
            </SelectContent>
          </Select>
          {errors.etf && <p className="text-xs text-rose-400">{errors.etf.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha compra</label>
          <Input placeholder="DD/MM/YYYY" {...register("fechaCompra")} />
          {errors.fechaCompra && <p className="text-xs text-rose-400">{errors.fechaCompra.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Nombre / descripción</label>
        <Input placeholder="Ej: Compra Google Q1" {...register("nombre")} />
        {errors.nombre && <p className="text-xs text-rose-400">{errors.nombre.message}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {([["cantidad", "Cantidad"], ["precioCompra", "Precio (USD)"], ["inversionInicial", "Inversión (USD)"]] as const).map(([name, label]) => (
          <div key={name} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <Input type="number" inputMode="decimal" min="0" step="any" placeholder="0.00" {...register(name, { valueAsNumber: true })} />
          </div>
        ))}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Guardando..." : "Agregar posición"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main drawer
// ---------------------------------------------------------------------------

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickAddDrawer({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<ModuleId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setSelected(null);
  }, [open]);

  async function submitCajaChile(data: CajaChileFormValues) {
    const isIngreso = INGRESO_CATS.has(data.categoria);
    await submitCaja("caja-chile", {
      fecha: data.fecha,
      categoria: data.categoria,
      descripcion: data.descripcion,
      ingreso: isIngreso ? data.monto : 0,
      gasto: isIngreso ? 0 : data.monto,
    });
  }

  async function submitCajaColombia(data: CajaColombiaFormValues) {
    const isIngreso = INGRESO_CATS.has(data.categoria);
    await submitCaja("caja-colombia", {
      fecha: data.fecha,
      categoria: data.categoria,
      descripcion: data.descripcion,
      ingreso: isIngreso ? data.monto : 0,
      gasto: isIngreso ? 0 : data.monto,
    });
  }

  async function submitCaja(moduleId: "caja-chile" | "caja-colombia", payload: object) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/transactions/${moduleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Error al guardar");
      }
      toast.success("Transacción agregada");
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitPrestamo(data: PrestamoInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions/prestamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Error al guardar");
      }
      toast.success("Préstamo registrado");
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitGeneric(path: string, data: object, successMsg: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Error al guardar");
      }
      toast.success(successMsg);
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedModule = MODULES.find((m) => m.id === selected);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          {selected ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelected(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Volver"
              >
                <FiChevronLeft size={18} />
              </button>
              <DrawerTitle>{selectedModule?.label}</DrawerTitle>
            </div>
          ) : (
            <DrawerTitle>¿Dónde registrar?</DrawerTitle>
          )}
        </DrawerHeader>

        <div className="px-4 pb-2 overflow-y-auto">
          {!selected && (
            <div className="space-y-2">
              {MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setSelected(mod.id)}
                  className="w-full flex items-center gap-3 rounded-xl border border-border p-4 text-left hover:bg-muted/50 active:scale-[0.98] transition-all"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${mod.color}`}>
                    {mod.icon}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{mod.label}</p>
                    <p className="text-xs text-muted-foreground">{mod.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selected === "caja-chile" && (
            <CajaChileForm onSubmit={submitCajaChile} isSubmitting={isSubmitting} />
          )}
          {selected === "caja-colombia" && (
            <CajaColombiaForm onSubmit={submitCajaColombia} isSubmitting={isSubmitting} />
          )}
          {selected === "prestamos" && (
            <PrestamoForm onSubmit={submitPrestamo} isSubmitting={isSubmitting} />
          )}
          {selected === "busetas" && (
            <BusetaForm
              onSubmit={(d) => submitGeneric("/api/transactions/busetas", d, "Viaje registrado")}
              isSubmitting={isSubmitting}
            />
          )}
          {selected === "portafolio" && (
            <PortafolioForm
              onSubmit={(d) => submitGeneric("/api/transactions/portafolio", d, "Posición agregada")}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Cancelar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
