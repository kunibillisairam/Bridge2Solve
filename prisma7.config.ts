// Load .env file only in local development (Vercel injects env vars natively)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
