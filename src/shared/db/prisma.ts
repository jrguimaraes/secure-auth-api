import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não definida");

const adapter = new PrismaPg({
    connectionString: url,
});

export const prisma = new PrismaClient({ adapter });
