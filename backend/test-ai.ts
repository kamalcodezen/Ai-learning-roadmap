import { generateDiagnosticQuestions } from "./src/modules/diagnostic/services/diagnostic-ai.service.js";

async function run() {
  try {
    const questions = await generateDiagnosticQuestions({
      targetRole: "Frontend Developer",
      experienceLevel: "BEGINNER",
      weeklyAvailableHours: 10
    });
    console.log("SUCCESS! Generated", questions.length, "questions.");
    console.log(JSON.stringify(questions, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  }
}

run();
