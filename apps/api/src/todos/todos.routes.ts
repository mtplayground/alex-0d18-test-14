import { Router, type Request, type Response } from "express";
import type { ZodIssue } from "zod";
import {
  createTodoSchema,
  todoIdParamSchema,
  updateTodoCompletedSchema
} from "./todos.schemas.js";
import {
  createTodo,
  listTodos,
  updateTodoCompleted,
  type TodoResponse
} from "./todos.service.js";

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

type UpdateTodoResponse = {
  todo: TodoResponse;
};

function formatValidationIssues(issues: ZodIssue[]): ErrorResponse["error"]["details"] {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
}

function sendValidationError(
  response: Response<ErrorResponse>,
  issues: ZodIssue[]
): void {
  response.status(400).json({
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid todo input",
      details: formatValidationIssues(issues)
    }
  });
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

todoRouter.patch(
  "/:id",
  async (
    request: Request<{ id: string }>,
    response: Response<UpdateTodoResponse | ErrorResponse>
  ) => {
    const parsedParams = todoIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      sendValidationError(response, parsedParams.error.issues);
      return;
    }

    const parsedBody = updateTodoCompletedSchema.safeParse(request.body);

    if (!parsedBody.success) {
      sendValidationError(response, parsedBody.error.issues);
      return;
    }

    try {
      const todo = await updateTodoCompleted(parsedParams.data.id, parsedBody.data);

      if (!todo) {
        response.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "Todo not found"
          }
        });
        return;
      }

      response.status(200).json({ todo });
    } catch (error) {
      console.error("Failed to update todo", error);
      response.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to update todo"
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
      sendValidationError(response, parsedBody.error.issues);
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
