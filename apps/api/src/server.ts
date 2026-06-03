import { createApp } from "./app.js";

const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_PORT = 8080;

function parsePort(value: string | undefined): number {
  if (!value) {
    return DEFAULT_PORT;
  }

  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

const host = process.env.HOST || DEFAULT_HOST;
let port: number;

try {
  port = parsePort(process.env.PORT);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Invalid server port");
  process.exit(1);
}

const app = createApp();

const server = app.listen(port, host, () => {
  console.log(`API server listening on http://${host}:${port}`);
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(`Received ${signal}; shutting down API server`);
  server.close((error?: Error) => {
    if (error) {
      console.error("API server shutdown failed", error);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
