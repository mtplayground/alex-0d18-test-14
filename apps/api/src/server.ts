import { createApp } from "./app.js";
import { formatConfigError, loadConfig, type AppConfig } from "./config.js";

let appConfig: AppConfig;

try {
  appConfig = loadConfig();
} catch (error) {
  console.error(formatConfigError(error));
  process.exit(1);
}

const app = createApp();

const server = app.listen(appConfig.port, appConfig.host, () => {
  console.log(`API server listening on http://${appConfig.host}:${appConfig.port}`);
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
