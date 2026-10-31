// import "server-only";
// import { PrismaClient } from "@/generated/prisma/client";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// // 開発時のホットリロードで接続が増え続けるのを防ぐ。
// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }


import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({ adapter });
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

// 開発時のホットリロードで接続が増え続けるのを防ぐ
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
