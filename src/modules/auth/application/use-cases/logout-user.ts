import { verifyRefreshToken } from "../../../../shared/auth/jwt.js";
import { prisma } from "../../../../shared/db/prisma.js";
import { AppError } from "../../../../shared/errors/app-error.js";

type LogoutUserRequest = {
    refreshToken: string;
};

type LogoutUserResponse = {
    message: string;
};

export class LogoutUserUseCase {
    async execute({
        refreshToken,
    }: LogoutUserRequest): Promise<LogoutUserResponse> {
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
        });

        if (!session) {
            throw new AppError("Sessão inválida", 401, "INVALID_SESSION");
        }

        if (session.revokedAt) {
            throw new AppError("Sessão já revogada", 401, "SESSION_ALREADY_REVOKED");
        }

        const now = new Date();

        await prisma.$transaction([
            prisma.session.update({
                where: {
                    id: session.id,
                },
                data: {
                    revokedAt: now,
                },
            }),
            prisma.refreshToken.updateMany({
                where: {
                    sessionId: session.id,
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            }),
        ]);

        return {
            message: "Logout realizado com sucesso",
        };
    }
}
