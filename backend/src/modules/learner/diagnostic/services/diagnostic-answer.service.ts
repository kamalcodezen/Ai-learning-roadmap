import prisma from "../../../../lib/prisma.js";
import type { SubmitDiagnosticAnswerInput } from "../schemas/diagnostic-answer.schema.js";

export const submitDiagnosticAnswer = async (
  attemptId: string,
  userId: string,
  data: SubmitDiagnosticAnswerInput,
) => {
  // 1. Check diagnostic attempt and enforce ownership
  const attempt = await prisma.diagnosticAttempt.findFirst({
    where: {
      id: attemptId,
      userId: userId,
    },
  });

  if (!attempt) {
    throw new Error("Diagnostic attempt not found.");
  }

  // 2. Check attempt status
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("This diagnostic attempt is no longer active.");
  }

  // 3. Find diagnostic question
  const question = await prisma.diagnosticQuestion.findUnique({
    where: {
      id: data.questionId,
    },
  });

  if (!question) {
    throw new Error("Diagnostic question not found.");
  }

  // 4. Check question status
  if (!question.isActive) {
    throw new Error("This diagnostic question is no longer active.");
  }

  let isCorrect = data.selectedAnswer.trim() === question.correctAnswer.trim();
  let evaluation: any = null;

  // If this is the 6th question, it's the open-ended Communication question.
  if (question.order === 6) {
    isCorrect = false; // Not a simple true/false

    const prompt = `
You are an expert technical interviewer evaluating a candidate's answer to an open-ended communication question.
Question asked: "${question.question}"
Context: ${question.description || "None"}
Target Role: ${attempt.targetRole || "Unknown"}

Candidate's Answer:
"${data.selectedAnswer.trim()}"

Evaluate the candidate's answer on the following 5 dimensions. Each score MUST be an integer between 0 and 100.
1. clarity
2. structure
3. technicalExplanation
4. relevance
5. completeness

Also provide a concise, learner-friendly feedback string explaining what they did well and what they could improve.

Return the response ONLY as a valid JSON object matching this exact structure:
{
  "clarity": 85,
  "structure": 80,
  "technicalExplanation": 90,
  "relevance": 88,
  "completeness": 75,
  "feedback": "Your explanation is good but could be structured more clearly."
}

DO NOT wrap the JSON in markdown code blocks. DO NOT include any conversational text. JUST return the raw JSON object.
`;

    try {
      const { ChatService } = await import("../../copilot/services/chat.service.js");
      const result = await ChatService.processJsonCompletion(
        "You return only valid JSON.",
        prompt
      );

      let content = result.reply;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }

      const parsed = JSON.parse(content);
      
      const clarity = Number(parsed.clarity) || 0;
      const structure = Number(parsed.structure) || 0;
      const technicalExplanation = Number(parsed.technicalExplanation) || 0;
      const relevance = Number(parsed.relevance) || 0;
      const completeness = Number(parsed.completeness) || 0;

      const score = Math.round((clarity + structure + technicalExplanation + relevance + completeness) / 5);

      evaluation = {
        clarity: Math.min(100, Math.max(0, clarity)),
        structure: Math.min(100, Math.max(0, structure)),
        technicalExplanation: Math.min(100, Math.max(0, technicalExplanation)),
        relevance: Math.min(100, Math.max(0, relevance)),
        completeness: Math.min(100, Math.max(0, completeness)),
        score: Math.min(100, Math.max(0, score)),
        feedback: parsed.feedback || "Explanation received."
      };
    } catch (error) {
      console.error("[Diagnostic Answer] Communication Evaluation Failed:", error);
      // We don't crash, we just leave evaluation = null so the learner can retry
    }
  }

  // 5. Save or update answer (Upsert)
  const answer = await prisma.diagnosticAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId: data.questionId,
      },
    },
    update: {
      selectedAnswer: data.selectedAnswer.trim(),
      isCorrect,
      evaluation: evaluation ? evaluation : undefined, // only overwrite if we got a new evaluation
    },
    create: {
      attemptId,
      questionId: data.questionId,
      selectedAnswer: data.selectedAnswer.trim(),
      isCorrect,
      evaluation,
    },
  });

  // 8. Count answered questions
  const answeredQuestions = await prisma.diagnosticAnswer.count({
    where: {
      attemptId,
    },
  });

  // 9. Update diagnostic attempt
  await prisma.diagnosticAttempt.update({
    where: {
      id: attemptId,
    },

    data: {
      answeredQuestions,
    },
  });

  // 10. Return safe answer response
  return {
    id: answer.id,
    attemptId: answer.attemptId,
    questionId: answer.questionId,
    selectedAnswer: answer.selectedAnswer,
    isCorrect: answer.isCorrect,
    evaluation: answer.evaluation,
    createdAt: answer.createdAt,
  };
};
