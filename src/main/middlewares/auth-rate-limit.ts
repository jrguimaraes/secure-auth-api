import rateLimit from "express-rate-limit";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;

function keyGenerator(ip: string | undefined) {
    return ip ?? "unknown-ip";
}

export const authRateLimit = rateLimit({
    windowMs: WINDOW_MS,
    limit: MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (request) => keyGenerator(request.ip),
    message: {
        ok: false,
        error: {
            code: "RATE_LIMIT_EXCEEDED",
            message:
                "Muitas tentativas de autenticação. Tente novamente em alguns minutos.",
            details: null,
        },
    },
});