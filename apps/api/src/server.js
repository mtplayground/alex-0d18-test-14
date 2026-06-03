import { createApp } from "./app.js";

const host = process.env.HOST || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "8080", 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid PORT value: ${process.env.PORT}`);
  process.exit(1);
}

const app = createApp();

const server = app.listen(port, host, () => {
  console.log(`API server listening on http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}; shutting down API server`);
  server.close((error) => {
    if (error) {
      console.error("API server shutdown failed", error);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
