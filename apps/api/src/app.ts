import express, { type Express, type Response } from "express";
import { todoRouter } from "./todos/todos.routes.js";

type HealthResponse = {
  status: "ok";
};

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/health", (_request, response: Response<HealthResponse>) => {
    response.status(200).json({ status: "ok" });
  });

  app.use("/todos", todoRouter);

  return app;
}
