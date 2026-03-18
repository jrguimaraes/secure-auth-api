import type { Request, Response } from "express";

export function notFoundHandler(_req: Request, res: Response) {
    return res.status(404).json({
        ok: false,
        error: {
            code: "NOT_FOUND",
            message: "Rota não encontrada",
            details: null,
        },
    });
}