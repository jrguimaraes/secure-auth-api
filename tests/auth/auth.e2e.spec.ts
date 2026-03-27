import { describe, expect, it } from "vitest";

import { makeRequest } from "../helpers/test-app.js";

function makeTestEmail() {
    return `user.${Date.now()}@email.com`;
}

describe("Auth E2E", () => {
    describe("POST /auth/register", () => {
        it("deve registrar um usuário com sucesso", async () => {
            const { request } = makeRequest();
            const email = makeTestEmail();

            const response = await request
                .post("/auth/register")
                .send({
                    email,
                    password: "12345678",
                });

            expect(response.status).toBe(201);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(email);
            expect(response.body.user.passwordHash).toBeUndefined();
        });
    });

    describe("POST /auth/login", () => {
        it("deve realizar login com sucesso e retornar access token e cookie de refresh", async () => {
            const { request } = makeRequest();
            const email = makeTestEmail();
            const password = "12345678";

            await request.post("/auth/register").send({
                email,
                password,
            });

            const response = await request
                .post("/auth/login")
                .send({
                    email,
                    password,
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.accessToken).toBeTypeOf("string");

            const setCookieHeader = response.headers["set-cookie"];
            expect(setCookieHeader).toBeDefined();
            expect(setCookieHeader[0]).toContain("refreshToken=");
        });
    });

    describe("GET /auth/me", () => {
        it("deve retornar o usuário autenticado", async () => {
            const { request } = makeRequest();
            const email = makeTestEmail();
            const password = "12345678";

            await request.post("/auth/register").send({
                email,
                password,
            });

            const loginResponse = await request
                .post("/auth/login")
                .send({
                    email,
                    password,
                });

            const accessToken = loginResponse.body.accessToken;

            const meResponse = await request
                .get("/auth/me")
                .set("Authorization", `Bearer ${accessToken}`);

            expect(meResponse.status).toBe(200);
            expect(meResponse.body.user).toBeDefined();
            expect(meResponse.body.user.email).toBe(email);
        });
    });

    describe("POST /auth/refresh", () => {
        it("deve renovar a sessão e rotacionar o refresh token", async () => {
            const { agent } = makeRequest();
            const email = makeTestEmail();
            const password = "12345678";

            await agent.post("/auth/register").send({
                email,
                password,
            });

            const loginResponse = await agent
                .post("/auth/login")
                .send({
                    email,
                    password,
                });

            const loginCookieHeader = loginResponse.headers["set-cookie"];
            expect(loginCookieHeader).toBeDefined();
            expect(loginCookieHeader[0]).toContain("refreshToken=");

            const refreshResponse = await agent.post("/auth/refresh");

            expect(refreshResponse.status).toBe(200);
            expect(refreshResponse.body.accessToken).toBeTypeOf("string");

            const rotatedCookieHeader = refreshResponse.headers["set-cookie"];
            expect(rotatedCookieHeader).toBeDefined();
            expect(rotatedCookieHeader[0]).toContain("refreshToken=");
        });

        it("deve detectar reutilização de refresh token e revogar a sessão", async () => {
            const { request } = makeRequest();
            const email = makeTestEmail();
            const password = "12345678";

            await request.post("/auth/register").send({
                email,
                password,
            });

            const loginResponse = await request
                .post("/auth/login")
                .send({
                    email,
                    password,
                });

            const loginCookieHeader = loginResponse.headers["set-cookie"];
            expect(loginCookieHeader).toBeDefined();

            const firstRefreshCookie = loginCookieHeader[0].split(";")[0];

            const firstRefreshResponse = await request
                .post("/auth/refresh")
                .set("Cookie", firstRefreshCookie);

            expect(firstRefreshResponse.status).toBe(200);

            const rotatedCookieHeader = firstRefreshResponse.headers["set-cookie"];
            expect(rotatedCookieHeader).toBeDefined();

            const secondRefreshCookie = rotatedCookieHeader[0].split(";")[0];

            const reuseAttemptResponse = await request
                .post("/auth/refresh")
                .set("Cookie", firstRefreshCookie);

            expect(reuseAttemptResponse.status).toBe(401);
            expect(reuseAttemptResponse.body.error.code).toBe(
                "REFRESH_TOKEN_REUSE_DETECTED",
            );

            const sessionRevokedResponse = await request
                .post("/auth/refresh")
                .set("Cookie", secondRefreshCookie);

            expect(sessionRevokedResponse.status).toBe(401);
        });
    });
});