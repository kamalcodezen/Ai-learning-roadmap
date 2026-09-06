// ============================================================
// DIAGNOSTIC SCORE & SKILL GAP THRESHOLDS
// Centralized classification constants for skill evaluations
// ============================================================

export const SCORE_THRESHOLDS = {
  STRONG: 80,
  MEDIUM: 50,
  WEAK: 0,
} as const;

export type SkillProficiencyStatus = "STRONG" | "MEDIUM" | "WEAK";
export type SkillGapSeverity = "critical" | "moderate" | "none";
export type SkillGapLevel = "HIGH" | "MEDIUM" | "NONE";

/**
 * Deterministically classifies a skill score percentage into STRONG, MEDIUM, or WEAK
 */
export const classifySkillScore = (score: number): SkillProficiencyStatus => {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));
  if (normalized >= SCORE_THRESHOLDS.STRONG) return "STRONG";
  if (normalized >= SCORE_THRESHOLDS.MEDIUM) return "MEDIUM";
  return "WEAK";
};

/**
 * Deterministically classifies skill gap severity
 */
export const classifySkillGapSeverity = (score: number): SkillGapSeverity => {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));
  if (normalized < SCORE_THRESHOLDS.MEDIUM) return "critical";
  if (normalized < SCORE_THRESHOLDS.STRONG) return "moderate";
  return "none";
};

/**
 * Deterministically classifies skill gap level (HIGH, MEDIUM, NONE)
 */
export const classifySkillGapLevel = (score: number): SkillGapLevel => {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));
  if (normalized < SCORE_THRESHOLDS.MEDIUM) return "HIGH";
  if (normalized < SCORE_THRESHOLDS.STRONG) return "MEDIUM";
  return "NONE";
};
