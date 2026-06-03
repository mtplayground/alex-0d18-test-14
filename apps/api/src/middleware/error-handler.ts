import type { ErrorRequestHandler, RequestHandler } from "express";

export type ErrorDetail = {
  path: string;
  message: string;
};

export type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
};

type AppErrorOptions = {
  statusCode: number;
  code: string;
  message: string;
  details?: ErrorDetail[];
};

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: ErrorDetail[];

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function isJsonParseError(error: unknown): boolean {
  if (!(error instanceof SyntaxError)) {
    return false;
  }

  const parseError = error as { status?: unknown; type?: unknown };

  return parseError.status === 400 && parseError.type === "entity.parse.failed";
}

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (isJsonParseError(error)) {
    return new AppError({
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid JSON body"
    });
  }

  return new AppError({
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error"
  });
}

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(
    new AppError({
      statusCode: 404,
      code: "NOT_FOUND",
      message: `Route not found: ${request.method} ${request.originalUrl}`
    })
  );
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const appError = normalizeError(error);
  const body: ErrorResponse = {
    error: {
      code: appError.code,
      message: appError.message
    }
  };

  if (appError.details) {
    body.error.details = appError.details;
  }

  if (appError.statusCode >= 500) {
    console.error(error);
  }

  response.status(appError.statusCode).json(body);
};
