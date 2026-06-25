import express from "express";
import cookieParser from "cookie-parser";

import { routes } from "./routes.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found-handler.js";
import { httpLogger } from "../shared/logger.js";

export function createApp() {
    const app = express();
    app.use(httpLogger);
    app.use(express.json());
    app.use(cookieParser());
    app.use(routes);

    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
