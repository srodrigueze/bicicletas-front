import { z } from "zod";

export const clientDataSchema = z.object({
  full_name: z.string().min(1, "El nombre es obligatorio").max(100),
  document: z
    .string()
    .min(6, "El documento debe tener al menos 6 dígitos")
    .max(14, "El documento no puede tener más de 14 dígitos")
    .regex(/^\d+$/, "El documento solo debe contener números"),
  phone: z.string().min(1, "El celular es obligatorio").max(15),
});

export const loanFormSchema = z.object({
  client: clientDataSchema,
  bicycle_ids: z.array(z.number()).min(1, "Selecciona al menos una bicicleta"),
});

export type LoanFormInput = z.infer<typeof loanFormSchema>;
