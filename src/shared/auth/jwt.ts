import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

type TokenPayload = {
    sub: string;
    email: string;
    sessionId?: string;
};

export function signAccessToken(payload: TokenPayload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
    });
}

export function signRefreshToken(payload: TokenPayload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
    });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload & {
        iat: number;
        exp: number;
    };
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload & {
        iat: number;
        exp: number;
    };
}
