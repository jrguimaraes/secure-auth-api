import argon2 from "argon2";

import { prisma } from "../../../../shared/db/prisma.js";
import { AppError } from "../../../../shared/errors/app-error.js";
import { signAccessToken, signRefreshToken } from "../../../../shared/auth/jwt.js";

type LoginUserRequest = {
    email: string;
    password: string;
    userAgent: string;
    ip: string;
};

type LoginUserResponse = {
    user: {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    };
    accessToken: string;
    refreshToken: string;
};

export class LoginUserUseCase {
    async execute({
        email,
        password,
        userAgent,
        ip
    }: LoginUserRequest): Promise<LoginUserResponse> {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            throw new AppError("Credenciais inválidas", 401, "INVALID_CREDENTIALS");
        }

        const passwordMatches = await argon2.verify(user.passwordHash, password);

        if (!passwordMatches) {
            throw new AppError("Credenciais inválidas", 401, "INVALID_CREDENTIALS");
        }

        const session = await prisma.session.create({
            data: {
                userId: user.id,
                userAgent,
                ip
            }
        });

        const tokenPayload = {
            sub: user.id,
            email: user.email,
            sessionId: session.id
        };

        const accessToken = signAccessToken(tokenPayload);
        const refreshToken = signRefreshToken(tokenPayload);

        const refreshTokenHash = await argon2.hash(refreshToken);

        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        await prisma.refreshToken.create({
            data: {
                sessionId: session.id,
                tokenHash: refreshTokenHash,
                expiresAt: new Date(Date.now() + sevenDaysInMs),
            },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            accessToken,
            refreshToken,
        };
    }
}
