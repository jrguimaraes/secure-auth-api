import argon2 from "argon2";

import { verifyRefreshToken, signAccessToken, signRefreshToken } from "../../../../shared/auth/jwt.js";
import { prisma } from "../../../../shared/db/prisma.js";
import { AppError } from "../../../../shared/errors/app-error.js";

type RefreshSessionRequest = {
    refreshToken: string;
};

type RefreshSessionResponse = {
    accessToken: string;
    refreshToken: string;
};

const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

export class RefreshSessionUseCase {
    async execute({
        refreshToken,
    }: RefreshSessionRequest): Promise<RefreshSessionResponse> {
        let payload: ReturnType<typeof verifyRefreshToken>;

        try {
            payload = verifyRefreshToken(refreshToken);
        } catch {
            throw new AppError("Refresh token inválido", 401, "INVALID_REFRESH_TOKEN");
        }

        if (!payload.sessionId) {
            throw new AppError("Refresh token inválido", 401, "INVALID_REFRESH_TOKEN");
        }

        const session = await prisma.session.findUnique({
            where: {
                id: payload.sessionId,
            },
            include: {
                user: true,
                refreshTokens: {
                    where: {
                        revokedAt: null,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        if (!session) {
            throw new AppError("Sessão inválida", 401, "INVALID_SESSION");
        }

        if (session.revokedAt) {
            throw new AppError("Sessão revogada", 401, "SESSION_REVOKED");
        }

        const currentRefreshToken = session.refreshTokens[0];

        if (!currentRefreshToken) {
            throw new AppError("Refresh token inválido", 401, "INVALID_REFRESH_TOKEN");
        }

        if (currentRefreshToken.expiresAt < new Date()) {
            throw new AppError("Refresh token expirado", 401, "REFRESH_TOKEN_EXPIRED");
        }

        const tokenMatches = await argon2.verify(
            currentRefreshToken.tokenHash,
            refreshToken,
        );

        if (!tokenMatches) {
            throw new AppError("Refresh token inválido", 401, "INVALID_REFRESH_TOKEN");
        }

        const newTokenPayload = {
            sub: session.user.id,
            email: session.user.email,
            sessionId: session.id,
        };

        const newAccessToken = signAccessToken(newTokenPayload);
        const newRefreshToken = signRefreshToken(newTokenPayload);
        const newRefreshTokenHash = await argon2.hash(newRefreshToken);

        const createdRefreshToken = await prisma.refreshToken.create({
            data: {
                sessionId: session.id,
                tokenHash: newRefreshTokenHash,
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
            },
        });

        await prisma.refreshToken.update({
            where: {
                id: currentRefreshToken.id,
            },
            data: {
                revokedAt: new Date(),
                replacedById: createdRefreshToken.id,
            },
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
}
