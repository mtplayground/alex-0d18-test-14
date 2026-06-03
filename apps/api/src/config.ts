type NodeEnv = "development" | "test" | "production";

export type AppConfig = Readonly<{
  databaseUrl: string;
  host: string;
  port: number;
  nodeEnv: NodeEnv;
  isProduction: boolean;
}>;

const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_PORT = 8080;
const DEFAULT_NODE_ENV: NodeEnv = "development";
const SUPPORTED_NODE_ENVS: readonly NodeEnv[] = ["development", "test", "production"];

function readRequiredEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`${name} must be set`);
  }

  return value;
}

function readDatabaseUrl(env: NodeJS.ProcessEnv): string {
  const value = readRequiredEnv(env, "DATABASE_URL");

  try {
    const parsedUrl = new URL(value);
    const isPostgres =
      parsedUrl.protocol === "postgres:" || parsedUrl.protocol === "postgresql:";

    if (!isPostgres) {
      throw new Error("protocol");
    }
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection string");
  }

  return value;
}

function readHost(env: NodeJS.ProcessEnv): string {
  return env.HOST?.trim() || DEFAULT_HOST;
}

function readPort(env: NodeJS.ProcessEnv): number {
  const value = env.PORT?.trim();

  if (!value) {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
}

function readNodeEnv(env: NodeJS.ProcessEnv): NodeEnv {
  const value = env.NODE_ENV?.trim() || DEFAULT_NODE_ENV;

  if (!SUPPORTED_NODE_ENVS.includes(value as NodeEnv)) {
    throw new Error("NODE_ENV must be one of development, test, or production");
  }

  return value as NodeEnv;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = readNodeEnv(env);

  return Object.freeze({
    databaseUrl: readDatabaseUrl(env),
    host: readHost(env),
    port: readPort(env),
    nodeEnv,
    isProduction: nodeEnv === "production"
  });
}

export function formatConfigError(error: unknown): string {
  return error instanceof Error ? error.message : "Invalid environment configuration";
}
