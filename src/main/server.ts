import "dotenv/config";

import { createApp } from "./app.js";

const app = createApp();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
    console.log(`[secure-auth] listening on :${port}`);
});
