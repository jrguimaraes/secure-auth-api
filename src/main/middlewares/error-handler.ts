import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../shared/errors/app-error.js";

export function errorHandler(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            ok: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details ?? null,
            },
        });
    }

    if (error instanceof ZodError) {
        return res.status(400).json({
            ok: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Dados de entrada inválidos",
                details: error.flatten,
            },
        });
    }

    console.error("[UNHANDLED_ERROR]", error);

    return res.status(500).json({
        ok: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro interno do servidor",
            details: null,
        },
    });
}