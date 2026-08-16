import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";
import { isProduction } from "../config/env.js";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found" }
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details }
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.flatten()
      }
    });
    return;
  }

  const maybeMulter = err as { code?: string; message?: string };
  if (maybeMulter?.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({
      error: { code: "FILE_TOO_LARGE", message: "Uploaded file exceeds the allowed size" }
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: isProduction ? "An unexpected error occurred" : err instanceof Error ? err.message : "Unknown error"
    }
  });
}
