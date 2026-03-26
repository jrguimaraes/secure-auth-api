import { z } from "zod";

export const registerBodySchema = z.object({
    email: z
        .email({ error: "E-mail inválido" })
        .trim()
        .toLowerCase(),
    password: z
        .string()
        .min(8, "A senha deve ter no mínimo 8 caracteres")
        .max(20, "A senha deve ter no máximo 20 caracteres")
});

export const loginBodySchema = z.object({
    email: z
        .email({ error: "E-mail inválido" })
        .trim()
        .toLowerCase(),
    password: z
        .string()
        .min(1, "Senha é obrigatória"),
});

export const refreshSessionBodySchema = z.object({
    refreshToken: z
        .string()
        .min(1, "Refresh token é obrigatório"),
});

export type RegisterBodySchema = z.infer<typeof registerBodySchema>;
export type LoginBodySchema = z.infer<typeof loginBodySchema>;
export type RefreshSessionBodySchema = z.infer<typeof refreshSessionBodySchema>;
