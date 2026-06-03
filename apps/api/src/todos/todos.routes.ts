import { Router, type Request, type Response } from "express";
import type { ZodIssue } from "zod";
import { createTodoSchema } from "./todos.schemas.js";
import { createTodo, listTodos, type TodoResponse } from "./todos.service.js";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Array<{
      path: string;
      message: string;
    }>;
  };
};

type CreateTodoResponse = {
  todo: TodoResponse;
};

type ListTodosResponse = {
  todos: TodoResponse[];
};

function formatValidationIssues(issues: ZodIssue[]): ErrorResponse["error"]["details"] {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
}

export const todoRouter = Router();

todoRouter.get(
  "/",
  async (_request: Request, response: Response<ListTodosResponse | ErrorResponse>) => {
    try {
      const todos = await listTodos();
      response.status(200).json({ todos });
    } catch (error) {
      console.error("Failed to list todos", error);
      response.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to list todos"
        }
      });
    }
  }
);

todoRouter.post(
  "/",
  async (request: Request, response: Response<CreateTodoResponse | ErrorResponse>) => {
    const parsedBody = createTodoSchema.safeParse(request.body);

    if (!parsedBody.success) {
      response.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid todo input",
          details: formatValidationIssues(parsedBody.error.issues)
        }
      });
      return;
    }

    try {
      const todo = await createTodo(parsedBody.data);
      response.status(201).json({ todo });
    } catch (error) {
      console.error("Failed to create todo", error);
      response.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to create todo"
        }
      });
    }
  }
);
