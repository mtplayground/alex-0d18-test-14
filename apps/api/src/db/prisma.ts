import { PrismaClient } from "@prisma/client";
import { loadConfig } from "../config.js";

const appConfig = loadConfig();

const globalForPrisma = globalThis as typeof globalThis & {
  prismaClient?: PrismaClient;
};

export const prisma =
  globalForPrisma.prismaClient ??
  new PrismaClient({
    log: appConfig.isProduction ? ["error"] : ["warn", "error"]
  });

if (!appConfig.isProduction) {
  globalForPrisma.prismaClient = prisma;
}
