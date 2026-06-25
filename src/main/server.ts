import "dotenv/config";

import { createApp } from "./app.js";
import { logger } from "../shared/logger.js";

const app = createApp();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
    logger.info({ port }, "secure_auth_api_started");
});
