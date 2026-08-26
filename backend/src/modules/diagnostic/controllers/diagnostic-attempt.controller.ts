import type { Request, Response } from "express";
import { createDiagnosticAttemptSchema } from "../schemas/diagnostic-attempt.schema.js";
import {
  createDiagnosticAttempt,
  completeDiagnosticAttempt,
} from "../services/diagnostic-attempt.service.js";

export const createDiagnosticAttemptController = async (
  req: Request,
  res: Response,
) => {
  const parsedBody = createDiagnosticAttemptSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid diagnostic attempt data.",
      errors: parsedBody.error.flatten(),
    });
  }

  const attempt = await createDiagnosticAttempt(parsedBody.data);

  return res.status(201).json({
    success: true,
    message: "Diagnostic attempt created successfully.",
    data: attempt,
  });
};

export const completeDiagnosticAttemptController = async (
  req: Request,
  res: Response,
) => {
  const { attemptId } = req.params;

  if (!attemptId || Array.isArray(attemptId)) {
    return res.status(400).json({
      success: false,
      message: "Valid diagnostic attempt ID is required.",
    });
  }

  try {
    const attempt = await completeDiagnosticAttempt(attemptId);

    return res.status(200).json({
      success: true,
      message: "Diagnostic attempt completed successfully.",
      data: attempt,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to complete diagnostic attempt.",
    });
  }
};
