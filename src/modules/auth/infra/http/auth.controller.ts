import type { Request, Response } from "express";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.js";
import { registerBodySchema } from "./auth.validators.js";

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
}