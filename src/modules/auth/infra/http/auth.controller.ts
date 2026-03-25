import type { Request, Response } from "express";

import { LoginUserUseCase } from "../../application/use-cases/login-user.js";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.js";
import { RefreshSessionUseCase } from "../../application/use-cases/refresh-session.js";
import { registerBodySchema, loginBodySchema, refreshSessionBodySchema } from "./auth.validators.js";

export class AuthController {
    async register(request: Request, response: Response) {
        const body = registerBodySchema.parse(request.body);

        const registerUserUseCase = new RegisterUserUseCase();

        const result = await registerUserUseCase.execute({
            email: body.email,
            password: body.password,
        });

        return response.status(201).json(result);
    }

    async login(request: Request, response: Response) {
        const body = loginBodySchema.parse(request.body);

        const loginUserUseCase = new LoginUserUseCase();

        const result = await loginUserUseCase.execute({
            email: body.email,
            password: body.password,
            userAgent: request.get("user-agent") ?? "unknown",
            ip: request.ip ?? "unknown",
        });

        return response.status(200).json(result);
    }

    async refresh(request: Request, response: Response) {
        const body = refreshSessionBodySchema.parse(request.body);

        const refreshSessionUseCase = new RefreshSessionUseCase();

        const result = await refreshSessionUseCase.execute({
            refreshToken: body.refreshToken,
        });

        return response.status(200).json(result);
    }
}