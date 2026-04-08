import { z } from "zod";

const dateRegex = /^\d{1,2}\/\d{2}\/\d{4}$/; // DD/MM/YYYY or D/MM/YYYY

/** Schema for Caja Chile / Caja Colombia transactions */
export const cajaTransactionSchema = z
  .object({
    fecha: z.string().regex(dateRegex, "Formato: DD/MM/YYYY"),
    categoria: z.enum(["Ingreso", "Gasto", "Préstamo", "Inversión"], {
      message: "Categoría requerida",
    }),
    descripcion: z.string().min(1, "Descripción requerida").max(200),
    ingreso: z.coerce.number().min(0, "Debe ser >= 0").default(0),
    gasto: z.coerce.number().min(0, "Debe ser >= 0").default(0),
  })
  .refine((d) => d.ingreso > 0 || d.gasto > 0, {
    message: "Ingreso o gasto debe ser mayor a 0",
    path: ["ingreso"],
  });

export type CajaTransactionInput = z.infer<typeof cajaTransactionSchema>;

/** Schema for Préstamos */
export const prestamoSchema = z.object({
  fecha: z.string().regex(dateRegex, "Formato: DD/MM/YYYY"),
  persona: z.string().min(1, "Persona requerida").max(100),
  operacion: z.string().min(1, "Operación requerida").max(100),
  monto: z.coerce.number().positive("Monto debe ser mayor a 0"),
  moneda: z.enum(["COP", "CLP", "USD"]).default("COP"),
  observaciones: z.string().max(300).default(""),
});

export type PrestamoInput = z.infer<typeof prestamoSchema>;

/** Schema for Control Busetas */
export const busetaSchema = z.object({
  fecha: z.string().regex(dateRegex, "Formato: DD/MM/YYYY"),
  buseta: z.string().min(1, "Buseta requerida"),
  ruta: z.string().default(""),
  pasajeros: z.coerce.number().int().min(0).default(0),
  precioPasaje: z.coerce.number().min(0).default(0),
  brutoTotal: z.coerce.number().min(0).default(0),
  acpm: z.coerce.number().min(0).default(0),
  basico: z.coerce.number().min(0).default(0),
  varios: z.coerce.number().min(0).default(0),
  montajeLlanta: z.coerce.number().min(0).default(0),
  otros: z.coerce.number().min(0).default(0),
  totalGastos: z.coerce.number().min(0).default(0),
  netoTotal: z.coerce.number().default(0),
  nota: z.string().max(300).default(""),
});

export type BusetaInput = z.infer<typeof busetaSchema>;

/** Schema for Portafolio entries */
export const portafolioSchema = z.object({
  etf: z.enum(["GOOG", "BTC"], {
    message: "Activo debe ser GOOG o BTC",
  }),
  nombre: z.string().min(1, "Nombre requerido"),
  fechaCompra: z.string().regex(dateRegex, "Formato: DD/MM/YYYY"),
  cantidad: z.coerce.number().positive("Cantidad debe ser mayor a 0"),
  precioCompra: z.coerce.number().positive("Precio debe ser mayor a 0"),
  inversionInicial: z.coerce.number().positive("Inversión debe ser mayor a 0"),
});

export type PortafolioInput = z.infer<typeof portafolioSchema>;

/** Mutation request wrapper — used for PUT and DELETE */
export const mutationRequestSchema = z.object({
  rowIndex: z.number().int().min(1, "rowIndex debe ser >= 1"),
  fingerprint: z.string().min(1, "fingerprint requerido"),
});

export type MutationRequest = z.infer<typeof mutationRequestSchema>;
