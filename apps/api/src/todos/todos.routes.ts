import { Router } from "express";
import type { ZodIssue } from "zod";
import { asyncHandler } from "../middleware/async-handler.js";
import { AppError, type ErrorDetail } from "../middleware/error-handler.js";
import {
  createTodoSchema,
  todoIdParamSchema,
  updateTodoCompletedSchema
} from "./todos.schemas.js";
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodoCompleted
} from "./todos.service.js";

function formatValidationIssues(issues: ZodIssue[]): ErrorDetail[] {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
}

function validationError(issues: ZodIssue[]): AppError {
  return new AppError({
    statusCode: 400,
    code: "VALIDATION_ERROR",
    message: "Invalid todo input",
    details: formatValidationIssues(issues)
  });
}

function todoNotFoundError(): AppError {
  return new AppError({
    statusCode: 404,
    code: "NOT_FOUND",
    message: "Todo not found"
  });
}

export const todoRouter = Router();

todoRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    const todos = await listTodos();
    response.status(200).json({ todos });
  })
);

todoRouter.patch(
  "/:id",
  asyncHandler(async (request, response) => {
    const parsedParams = todoIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw validationError(parsedParams.error.issues);
    }

    const parsedBody = updateTodoCompletedSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw validationError(parsedBody.error.issues);
    }

    const todo = await updateTodoCompleted(parsedParams.data.id, parsedBody.data);

    if (!todo) {
      throw todoNotFoundError();
    }

    response.status(200).json({ todo });
  })
);

todoRouter.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const parsedParams = todoIdParamSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw validationError(parsedParams.error.issues);
    }

    const deleted = await deleteTodo(parsedParams.data.id);

    if (!deleted) {
      throw todoNotFoundError();
    }

    response.status(204).send();
  })
);

todoRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const parsedBody = createTodoSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw validationError(parsedBody.error.issues);
    }

    const todo = await createTodo(parsedBody.data);
    response.status(201).json({ todo });
  })
);
