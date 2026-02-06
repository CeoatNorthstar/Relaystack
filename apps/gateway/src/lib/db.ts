// Set DATABASE_URL from individual parts if not provided (for ECS with Secrets Manager)
if (!process.env.DATABASE_URL) {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "5432";
  const name = process.env.DB_NAME || "relaystack";
  const user = process.env.DB_USERNAME;
  const pass = process.env.DB_PASSWORD;
  
  if (host && user && pass) {
    process.env.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${name}`;
    console.log(`✓ Constructed DATABASE_URL from parts (host: ${host})`);
  }
}

import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();
export const prisma = db; // Alias for convenience

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
