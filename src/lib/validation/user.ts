import { z } from "zod";

export const userCreateSchema = z.object({
  full_name: z.string().min(1, "El nombre es obligatorio").max(150),
  document: z
    .string()
    .min(4, "El documento debe tener al menos 4 dígitos")
    .max(20)
    .regex(/^\d+$/, "El documento solo debe contener números"),
  role: z.enum(["administrador", "operador"]),
});

export type UserCreateFormInput = z.infer<typeof userCreateSchema>;

export const userEditSchema = z.object({
  full_name: z.string().min(1, "El nombre es obligatorio").max(150),
  status: z.enum(["activo", "inactivo"]),
});

export type UserEditFormInput = z.infer<typeof userEditSchema>;
