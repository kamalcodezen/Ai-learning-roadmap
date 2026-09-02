import { ChatService } from "../../copilot/services/chat.service.js";

export type GeneratedInterviewQuestion = {
  question: string;
  order: number;
};

export type InterviewAIContext = {
  targetRole: string;
  experienceLevel: string;
};

export const generateInterviewQuestions = async (
  context: InterviewAIContext,
): Promise<GeneratedInterviewQuestion[]> => {
  const prompt = `
You are an expert technical interviewer.
Generate EXACTLY 3 mock interview questions for a candidate with the following profile:
- Target Role: ${context.targetRole}
- Experience Level: ${context.experienceLevel}

Questions should be open-ended and progressively evaluate:
1. Technical Knowledge and Concepts
2. Practical Understanding and Problem Solving
3. Scenario-based Architecture or System Design

Return the response ONLY as a valid JSON object matching this exact structure:
{
  "questions": [
    {
      "question": "The question text",
      "order": 1
    }
  ]
}

DO NOT wrap the JSON in markdown code blocks. DO NOT include any conversational text. JUST return the raw JSON object.
`;

  try {
    const result = await ChatService.processJsonCompletion(
      "You return only valid JSON.",
      prompt
    );

    let content = result.reply;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error("[Interview AI] JSON Parse Error. Cleaned Content:", content);
      throw parseError;
    }
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length !== 3) {
       throw new Error("AI did not return exactly 3 questions.");
    }

    return parsed.questions as GeneratedInterviewQuestion[];
  } catch (error: any) {
    console.error("Interview AI Question Gen Failed:", error);
    throw new Error("Failed to generate mock interview questions. Please try again later.");
  }
};

export type InterviewEvaluationResult = {
  technicalKnowledge: number;
  problemSolving: number;
  clarity: number;
  practicalUnderstanding: number;
  communication: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
};

export const evaluateInterviewAnswer = async (
  questionText: string,
  answerText: string,
  targetRole: string,
): Promise<InterviewEvaluationResult> => {
  const prompt = `
You are an expert technical interviewer evaluating a candidate's answer to a mock interview question.
Target Role: ${targetRole}

Question asked: "${questionText}"
Candidate's Answer: "${answerText}"

Evaluate the candidate's answer on the following 5 dimensions. Each score MUST be an integer between 0 and 100.
1. technicalKnowledge: Accuracy and depth of technical concepts.
2. problemSolving: Ability to approach and solve the scenario.
3. clarity: How clear and easy to understand the answer is.
4. practicalUnderstanding: Evidence of real-world applicability.
5. communication: Overall presentation and articulation.

Also provide:
- feedback: A concise, learner-friendly paragraph explaining what they did well and what they could improve.
- strengths: Array of 1-3 short strings highlighting strengths.
- improvements: Array of 1-3 short strings highlighting areas to improve.

Return the response ONLY as a valid JSON object matching this exact structure:
{
  "technicalKnowledge": 85,
  "problemSolving": 80,
  "clarity": 90,
  "practicalUnderstanding": 88,
  "communication": 85,
  "feedback": "Your explanation is good but...",
  "strengths": ["Clear structure", "Good examples"],
  "improvements": ["Mention performance tradeoffs"]
}

DO NOT wrap the JSON in markdown code blocks. DO NOT include any conversational text. JUST return the raw JSON object.
`;

  try {
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
    
    return {
      technicalKnowledge: Math.min(100, Math.max(0, Number(parsed.technicalKnowledge) || 0)),
      problemSolving: Math.min(100, Math.max(0, Number(parsed.problemSolving) || 0)),
      clarity: Math.min(100, Math.max(0, Number(parsed.clarity) || 0)),
      practicalUnderstanding: Math.min(100, Math.max(0, Number(parsed.practicalUnderstanding) || 0)),
      communication: Math.min(100, Math.max(0, Number(parsed.communication) || 0)),
      feedback: parsed.feedback || "Answer evaluated.",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    };
  } catch (error) {
    console.error("[Interview AI] Evaluation Failed:", error);
    throw new Error("Failed to evaluate interview answer.");
  }
};
