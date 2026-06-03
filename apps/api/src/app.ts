import cors from "cors";
import express, { type Express, type Response } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { todoRouter } from "./todos/todos.routes.js";

type HealthResponse = {
  status: "ok";
};

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../..");

function resolveWebDistPath(): string {
  const configuredPath = process.env.WEB_DIST_DIR?.trim();

  if (configuredPath) {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(repositoryRoot, configuredPath);
  }

  return path.resolve(currentDirectory, "../../web/dist");
}

function shouldServeFrontend(requestPath: string): boolean {
  return !requestPath.startsWith("/todos") && requestPath !== "/health";
}

function serveFrontendBuild(app: Express): void {
  const webDistPath = resolveWebDistPath();
  const indexPath = path.join(webDistPath, "index.html");

  if (!existsSync(indexPath)) {
    return;
  }

  app.use(express.static(webDistPath, { index: false }));
  app.get("*", (request, response, next) => {
    if (!shouldServeFrontend(request.path)) {
      next();
      return;
    }

    response.sendFile(indexPath);
  });
}

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response: Response<HealthResponse>) => {
    response.status(200).json({ status: "ok" });
  });

  app.use("/todos", todoRouter);
  serveFrontendBuild(app);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
