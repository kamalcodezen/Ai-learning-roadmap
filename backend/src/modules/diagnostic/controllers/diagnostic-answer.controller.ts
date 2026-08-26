import type { Request, Response } from "express";
import { submitDiagnosticAnswerSchema } from "../schemas/diagnostic-answer.schema.js";
import { submitDiagnosticAnswer } from "../services/diagnostic-answer.service.js";

export const submitDiagnosticAnswerController = async (
  req: Request,
  res: Response,
) => {
  const parsedBody = submitDiagnosticAnswerSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid diagnostic answer data.",
      errors: parsedBody.error.flatten(),
    });
  }

  const { attemptId } = req.params;

  if (!attemptId || Array.isArray(attemptId)) {
    return res.status(400).json({
      success: false,
      message: "Valid diagnostic attempt ID is required.",
    });
  }

  try {
    const answer = await submitDiagnosticAnswer(attemptId, parsedBody.data);

    return res.status(201).json({
      success: true,
      message: "Diagnostic answer submitted successfully.",
      data: answer,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to submit answer.",
    });
  }
};
