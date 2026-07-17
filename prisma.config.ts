import { defineConfig } from "prisma/config";
import { config as loadEnv } from "dotenv";

// Prisma CLI only auto-loads .env, unlike Next.js which layers
// .env.local on top. Replicate that precedence here so `prisma migrate
// dev` / `db push` hit the same database as `next dev` does.
loadEnv();
loadEnv({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
});
