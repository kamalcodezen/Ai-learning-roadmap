import type { RequestHandler } from "express";

export const notFoundMiddleware: RequestHandler = (req, res) => {
  res.status(400).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
