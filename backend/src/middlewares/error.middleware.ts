import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import prisma from "../lib/prisma.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  _next,
) => {
  // Capture basic safe information
  const statusCode = error instanceof ZodError ? 400 : (res.statusCode !== 200 ? res.statusCode : 500);
  const errorType = error.name || "UnknownError";
  const message = error.message || "An unexpected error occurred.";
  const endpoint = req.originalUrl;
  const method = req.method;
  
  // Safely get userId if it was attached to req (e.g., from auth middleware)
  const userId = (req as any).user?.id || (req as any).session?.userId || null;
  
  const data: any = {
    errorType,
    message,
    endpoint,
    method,
    statusCode,
    userId,
  };
  if (error.stack) data.metadata = { stack: error.stack.substring(0, 1000) };

  // Create an error log record asynchronously (fire and forget)
  prisma.errorLog.create({ data }).catch((err) => console.error("Failed to write to ErrorLog:", err));

  // Zod validation error
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data.",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Unexpected server error
  console.error("[Internal Server Error]", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};
