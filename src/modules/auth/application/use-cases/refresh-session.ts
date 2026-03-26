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

        const activeRefreshToken = session.refreshTokens.find(
            (token) => token.revokedAt === null,
        );

        if (!activeRefreshToken) {
            throw new AppError("Refresh token inválido", 401, "INVALID_REFRESH_TOKEN");
        }

        if (activeRefreshToken.expiresAt < new Date()) {
            throw new AppError("Refresh token expirado", 401, "REFRESH_TOKEN_EXPIRED");
        }

        const matchesActiveToken = await argon2.verify(
            activeRefreshToken.tokenHash,
            refreshToken,
        );

        if (!matchesActiveToken) {
            for (const storedToken of session.refreshTokens) {
                const matchesStoredToken = await argon2.verify(
                    storedToken.tokenHash,
                    refreshToken,
                );

                if (matchesStoredToken) {
                    await prisma.$transaction([
                        prisma.session.update({
                            where: {
                                id: session.id,
                            },
                            data: {
                                revokedAt: new Date(),
                            },
                        }),
                        prisma.refreshToken.updateMany({
                            where: {
                                sessionId: session.id,
                                revokedAt: null,
                            },
                            data: {
                                revokedAt: new Date(),
                            },
                        }),
                    ]);

                    throw new AppError(
                        "Reuse de refresh token detectado. Sessão revogada.",
                        401,
                        "REFRESH_TOKEN_REUSE_DETECTED",
                    );
                }
            }

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
                id: activeRefreshToken.id,
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
