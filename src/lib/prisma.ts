import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// PrismaClient is attached to the `globalThis` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  // Use connection URL from environment or fall back to a local placeholder URL during builds
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/problembridge?schema=public";

  // Create standard connection pool for PostgreSQL
  const pool = new pg.Pool({
    connectionString: dbUrl,
  });
  
  // Set up the Prisma v7 PostgreSQL driver adapter
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
