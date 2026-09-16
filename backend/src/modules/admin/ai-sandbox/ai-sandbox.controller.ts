import type { Request, Response, NextFunction } from "express";
import * as aiSandboxService from "./ai-sandbox.service.js";

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
