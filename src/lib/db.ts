import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In Next.js hot-reloading dev environment, prevent creating multiple database instances.
const getPrismaInstance = () => {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db'
  });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? getPrismaInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
