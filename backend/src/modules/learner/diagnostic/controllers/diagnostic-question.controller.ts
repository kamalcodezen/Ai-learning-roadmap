import type { Request, Response } from "express";
import { diagnosticQuestionsQuerySchema } from "../schemas/diagnostic-question.schema.js";
import { getDiagnosticQuestions } from "../services/diagnostic-question.service.js";

export const getDiagnosticQuestionsController = async (
  req: Request,
  res: Response,
) => {
  const parsedQuery = diagnosticQuestionsQuerySchema.safeParse({
    ...req.query,
    userId: req.userId as string,
  });

  if (!parsedQuery.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid diagnostic question query. Details: " + JSON.stringify(parsedQuery.error.flatten()),
      errors: parsedQuery.error.flatten(),
    });
  }

  const questions = await getDiagnosticQuestions(parsedQuery.data);

  return res.status(200).json({
    success: true,
    message: "Diagnostic questions fetched successfully.",
    data: questions,
  });
};
