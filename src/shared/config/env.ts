import { z } from "zod";
import { logger } from "../logger.js";

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),

    JWT_ACCESS_EXPIRES_IN: z.string().min(1),
    JWT_REFRESH_EXPIRES_IN: z.string().min(1),

    COOKIE_REFRESH_TOKEN_NAME: z.string().min(1),
    COOKIE_REFRESH_TOKEN_MAX_AGE_MS: z.coerce.number().int().positive(),
    COOKIE_SECURE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    logger.fatal(
        { details: z.treeifyError(parsedEnv.error) },
        "invalid_environment_variables",
    );
    throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
