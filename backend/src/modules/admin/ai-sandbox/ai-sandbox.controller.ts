import type { Request, Response, NextFunction } from "express";
import * as aiSandboxService from "./ai-sandbox.service.js";

/**
 * Retrieves the catalog of active LLM models available in the AI Sandbox.
 * @route GET /api/admin/ai-sandbox/models
 */
export const getModels = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const models = await aiSandboxService.getModelList();
    res.json({
      models,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Executes inference testing for custom prompt/system-prompt combinations with live telemetry.
 * @route POST /api/admin/ai-sandbox/test
 */
export const testPrompt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prompt, systemPrompt, model, temperature, maxTokens } = req.body;
    const adminId = (req.query.userId as string) || (req.body.userId as string);

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required." });
    }

    const result = await aiSandboxService.testAiPrompt({
      prompt: String(prompt),
      systemPrompt: systemPrompt ? String(systemPrompt) : undefined,
      model: model ? String(model) : undefined,
      temperature: temperature !== undefined ? Number(temperature) : undefined,
      maxTokens: maxTokens !== undefined ? Number(maxTokens) : undefined,
      adminId,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};
