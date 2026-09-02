import { ChatService } from "../../copilot/services/chat.service.js";

export type GeneratedDiagnosticQuestion = {
  question: string;
  description: string;
  category: string;
  skill: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  explanation: string;
};

export type DiagnosticAIContext = {
  targetRole: string;
  experienceLevel: string;
  weeklyAvailableHours: number;
};

export const generateDiagnosticQuestions = async (
  context: DiagnosticAIContext,
): Promise<GeneratedDiagnosticQuestion[]> => {
  const prompt = `
You are an expert technical interviewer and career mentor.
Generate EXACTLY 6 diagnostic questions for a user with the following profile:
- Target Role: ${context.targetRole}
- Experience Level: ${context.experienceLevel}

Questions 1 to 5 MUST be multiple-choice questions (MCQ) that progressively test:
1. Fundamentals
2. Conceptual understanding
3. Practical application
4. Problem solving
5. Role-specific real-world reasoning

Question 6 MUST be an open-ended communication question. It should ask the user to explain a technical concept clearly in their own words. The question must be relevant to the target role and experience level.

Return the response ONLY as a valid JSON object matching this exact structure:
{
  "questions": [
    {
      "question": "The question text",
      "description": "Optional context for the question",
      "category": "Broad topic (e.g., Frontend, Backend, Communication)",
      "skill": "Specific skill (e.g., React, SQL, Technical Communication)",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Use empty array [] for Question 6
      "correctAnswer": "The exact string of the correct option", // Use empty string "" for Question 6
      "difficulty": "beginner/intermediate/advanced",
      "explanation": "Why this answer is correct (or what a good explanation entails for Q6)"
    }
  ]
}

DO NOT wrap the JSON in markdown code blocks. DO NOT include any conversational text. JUST return the raw JSON object.
`;

  try {
    const result = await ChatService.processJsonCompletion(
      "You return only valid JSON.", // System context
      prompt // User prompt
    );

    let content = result.reply;
    
    console.log(`[Diagnostic AI] Used Provider: ${result.provider} (Model: ${result.model})`);
    console.log("[Diagnostic AI] Raw Output:", content);

    // Extract the first JSON object or array found in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error("[Diagnostic AI] JSON Parse Error. Cleaned Content:", content);
      throw parseError;
    }
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length !== 6) {
       throw new Error("AI did not return exactly 6 questions.");
    }

    return parsed.questions as GeneratedDiagnosticQuestion[];
  } catch (error: any) {
    console.error("AI Fallback Chain Failed:", error);
    throw new Error("Failed to generate personalized diagnostic questions. Please try again later.");
  }
};
