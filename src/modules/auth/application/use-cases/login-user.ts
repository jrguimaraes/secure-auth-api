import argon2 from "argon2";

import { prisma } from "../../../../shared/db/prisma.js";
import { AppError } from "../../../../shared/errors/app-error.js";

type LoginUserRequest = {
    email: string;
    password: string;
};

type LoginUserResponse = {
    user: {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    };
};

export class LoginUserUseCase {
    async execute({
        email,
        password,
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

        return {
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }
}
