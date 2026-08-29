import { generateDiagnosticQuestions } from "./src/modules/diagnostic/services/diagnostic-ai.service.js";

async function run() {
  try {
    const questions = await generateDiagnosticQuestions({
      targetRole: "Frontend Developer",
      experienceLevel: "Beginner",
      weeklyAvailableHours: 10
    });
    console.log("Success! Questions:", questions.length);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

run();
