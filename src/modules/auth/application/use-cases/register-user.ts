import argon2 from "argon2";
import { prisma } from "../../../../shared/db/prisma.js";
import { AppError } from "../../../../shared/errors/app-error.js";

type RegisterUserRequest = {
    email: string;
    password: string;
};

type RegisterUserResponse = {
    user: {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    };
};

export class RegisterUserUseCase {
    async execute({
        email,
        password,
    }: RegisterUserRequest): Promise<RegisterUserResponse> {
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            throw new AppError("E-mail já está em uso", 409, "EMAIL_ALREADY_IN_USE");
        }

        const passwordHash = await argon2.hash(password);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return { user };
    }
}