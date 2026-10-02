import { z } from "zod";

export const bicycleSizeValues = ["small", "medium", "large"] as const;
export const bicycleConditionValues = ["good", "bad"] as const;
export const bicycleBrakeCountValues = [0, 1, 2] as const;

export const bicycleFormSchema = z.object({
  code: z
    .string()
    .min(1, "El código es obligatorio")
    .max(5, "El código no puede tener más de 5 caracteres"),
  size: z.enum(bicycleSizeValues),
  condition: z.enum(bicycleConditionValues),
  rueditas_asistencia: z.boolean(),
  tiene_pedales: z.boolean(),
  observations: z.string().max(2000, "Máximo 2000 caracteres").optional(),
  numero_frenos: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

export type BicycleFormInput = z.infer<typeof bicycleFormSchema>;
