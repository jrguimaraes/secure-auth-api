import { prisma } from "../../../../shared/db/prisma.js";
import { AppError } from "../../../../shared/errors/app-error.js";

type GetMeRequest = {
    userId: string;
};

type GetMeResponse = {
    user: {
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    };
};

export class GetMeUseCase {
    async execute({ userId }: GetMeRequest): Promise<GetMeResponse> {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError("Usuário não encontrado", 404, "USER_NOT_FOUND");
        }

        return {
            user,
        };
    }
}
