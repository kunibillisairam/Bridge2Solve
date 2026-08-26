import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// In Prisma v7, database connectors require explicit driver adapters
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/db",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("No seed data specified for this technical foundation phase.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
