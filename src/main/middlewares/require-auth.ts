import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../../shared/auth/jwt.js";
import { AppError } from "../../shared/errors/app-error.js";

export function requireAuth(
    request: Request,
    _response: Response,
    next: NextFunction,
) {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
        throw new AppError(
            "Token de acesso não informado",
            401,
            "MISSING_ACCESS_TOKEN",
        );
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new AppError(
            "Token de acesso inválido",
            401,
            "INVALID_ACCESS_TOKEN",
        );
    }

    try {
        const payload = verifyAccessToken(token);

        request.user = {
            sub: payload.sub,
            email: payload.email,
            sessionId: payload.sessionId,
        };

        return next();
    } catch {
        throw new AppError(
            "Token de acesso inválido",
            401,
            "INVALID_ACCESS_TOKEN",
        );
    }
}
