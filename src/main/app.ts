import express from "express";
import { routes } from "./routes.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found-handler.js";

export function createApp() {
    const app = express();
    app.use(express.json());
    app.use(routes);

    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
