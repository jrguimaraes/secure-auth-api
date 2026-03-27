import { Request, Response } from "express";

import { LoginUserUseCase } from "../../application/use-cases/login-user.js";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.js";
import { LogoutUserUseCase } from "../../application/use-cases/logout-user.js";
import { RefreshSessionUseCase } from "../../application/use-cases/refresh-session.js";
import { GetMeUseCase } from "../../application/use-cases/get-me.js";
import { registerBodySchema, loginBodySchema } from "./auth.validators.js";
import { env } from "../../../../shared/config/env.js";
import { getRefreshTokenCookieOptions } from "../../../../shared/http/cookies.js";
import { AppError } from "../../../../shared/errors/app-error.js";

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

        response.cookie(
            env.COOKIE_REFRESH_TOKEN_NAME,
            result.refreshToken,
            getRefreshTokenCookieOptions(),
        );

        return response.status(200).json({
            user: result.user,
            accessToken: result.accessToken,
        });
    }

    async refresh(request: Request, response: Response) {
        const refreshToken = request.cookies?.[env.COOKIE_REFRESH_TOKEN_NAME];

        if (!refreshToken) {
            throw new AppError(
                "Refresh token não encontrado",
                401,
                "MISSING_REFRESH_TOKEN",
            );
        }

        const refreshSessionUseCase = new RefreshSessionUseCase();

        const result = await refreshSessionUseCase.execute({
            refreshToken,
        });

        response.cookie(
            env.COOKIE_REFRESH_TOKEN_NAME,
            result.refreshToken,
            getRefreshTokenCookieOptions(),
        );

        return response.status(200).json({
            accessToken: result.accessToken,
        });
    }

    async logout(request: Request, response: Response) {
        const refreshToken = request.cookies?.[env.COOKIE_REFRESH_TOKEN_NAME];

        if (!refreshToken) {
            throw new AppError(
                "Refresh token não encontrado",
                401,
                "MISSING_REFRESH_TOKEN",
            );
        }

        const logoutUserUseCase = new LogoutUserUseCase();

        const result = await logoutUserUseCase.execute({
            refreshToken,
        });

        response.clearCookie(
            env.COOKIE_REFRESH_TOKEN_NAME,
            getRefreshTokenCookieOptions(),
        );

        return response.status(200).json(result);
    }

    async me(request: Request, response: Response) {
        if (!request.user?.sub) {
            throw new AppError("Usuário não autenticado", 401, "UNAUTHENTICATED");
        }

        const getMeUseCase = new GetMeUseCase();

        const result = await getMeUseCase.execute({
            userId: request.user.sub,
        });

        return response.status(200).json(result);
    }
}