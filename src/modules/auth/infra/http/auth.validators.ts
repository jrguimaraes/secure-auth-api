import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.email("E-mail inválido").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(20, "A senha deve ter no máximo 100 caracteres")
});

export type RegisterBodySchema = z.infer<typeof registerBodySchema>;