import { z } from "zod";

export const loginSchema = z.object({
  document: z
    .string()
    .min(1, "Ingresa tu número de documento")
    .regex(/^\d+$/, "El documento solo debe contener números"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Ingresa tu contraseña actual"),
    new_password: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirm_password: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
