import "./cardClass.css";

/**
 * Static (non-hover) big-card style — used by DashboardCard.
 * Kept as a shared class string so callers can reuse it (e.g. learning-path milestone cards).
 */
export const plainCardClass =
  "relative overflow-hidden rounded-xl border border-[#E6E9EE]  backdrop-blur-md transition-all duration-300 dashboard-card dark:border-[rgba(159,84,247,0.15)] p-6";

/**
 * Shared gradient + corner-hover card style for KPI / compact dashboard cards.
 * The hover gradient background lives in CSS (kpi-card-gradient) so it can be reused
 * by both KpiCard and any callers that apply the raw class.
 */
export const glowCardClass =
  "group relative overflow-hidden rounded-xl transition-all duration-300 border-2 border-background shadow-none dashboard-card";
