import supertest from "supertest";

import { createApp } from "../../src/main/app.js";

export function makeRequest() {
    const app = createApp();

    return {
        request: supertest(app),
        agent: supertest.agent(app),
    };
}