import type { CookieOptions } from "express";
import { env } from "../config/env.js";

export function getRefreshTokenCookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: "strict",
        maxAge: env.COOKIE_REFRESH_TOKEN_MAX_AGE_MS,
        path: "/auth",
    };
}
