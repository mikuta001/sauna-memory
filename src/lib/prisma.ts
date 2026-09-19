import "server-only";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// 開発時のホットリロードで接続が増え続けるのを防ぐ。
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
