import { Router } from "express";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

import * as dashboardController from "./dashboard/dashboard.controller.js";
import * as usersController from "./users/users.controller.js";
import * as analyticsController from "./analytics/analytics.controller.js";

import * as systemHealthController from "./system-health/system-health.controller.js";
import * as auditLogsController from "./audit-logs/audit-logs.controller.js";
import * as errorLogsController from "./error-logs/error-logs.controller.js";
import * as aiUsageController from "./ai-usage/ai-usage.controller.js";
import * as activityController from "./activity/activity.controller.js";

import * as roadmapsController from "./roadmaps/roadmaps.controller.js";
import * as assessmentsController from "./assessments/assessments.controller.js";
import * as projectsController from "./projects/projects.controller.js";
import * as skillHealthController from "./skill-health/skill-health.controller.js";
import * as learningDebtController from "./learning-debt/learning-debt.controller.js";
import * as careerReadinessController from "./career-readiness/career-readiness.controller.js";
import * as jobRealityController from "./job-reality/job-reality.controller.js";
import * as skillProofController from "./skill-proof/skill-proof.controller.js";

const router = Router();

// All routes here are protected by the requireAdmin middleware
router.use(requireAdmin);

// Dashboard routes
router.get("/dashboard", dashboardController.getDashboardOverview);

// User Management routes
router.get("/users", usersController.getUsers);
router.patch("/users/:id/role", usersController.updateUserRole);
router.delete("/users/:id", usersController.deleteUser);

// System routes
router.get("/system-health", systemHealthController.getSystemHealth);
router.get("/audit-logs", auditLogsController.getAuditLogs);
router.get('/error-logs', errorLogsController.getAdminErrorLogs);
router.get('/ai-usage', aiUsageController.getAdminAiUsage);
router.get('/activity', activityController.getAdminActivity);

// Learning routes
router.get('/roadmaps', roadmapsController.getAdminRoadmaps);
router.get('/assessments', assessmentsController.getAdminAssessments);
router.get('/projects', projectsController.getAdminProjects);
router.get('/skill-health', skillHealthController.getAdminSkillHealth);
router.get('/learning-debt', learningDebtController.getAdminLearningDebt);
router.get('/career-readiness', careerReadinessController.getAdminCareerReadiness);
router.get('/job-reality', jobRealityController.getAdminJobReality);
router.get('/skill-proof', skillProofController.getAdminSkillProof);

// Analytics routes
router.get('/analytics', analyticsController.getAdminAnalytics);
router.get('/export/:entity', analyticsController.exportData);

export default router;
