import type { Request, Response, NextFunction } from "express";
import * as adminUsersService from "./users.service.js";

/**
 * Retrieves paginated user profiles with keyword searching, role filtering, and creation date ranges.
 * @route GET /api/admin/users
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 10;
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;
    const plan = req.query.plan as string | undefined;
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;

    const result = await adminUsersService.getUsers(skip, take, search, role, days, plan);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Modifies subscription tier for target account.
 * @route PATCH /api/admin/users/:id/plan
 */
export const updateUserPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = req.adminId!;
    const targetUserId = req.params.id as string;
    const { plan } = req.body;

    const updatedUser = await adminUsersService.updateUserPlan(adminId, targetUserId, plan as string);
    res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    if (error.message.includes("Invalid plan") || error.message.includes("not found")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Modifies RBAC privileges for target account.
 * @route PATCH /api/admin/users/:id/role
 */
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = req.adminId!;
    const targetUserId = req.params.id as string;
    const { role } = req.body;

    const updatedUser = await adminUsersService.updateUserRole(adminId, targetUserId, role as string);
    res.json({ success: true, user: updatedUser });
  } catch (error: any) {
    if (error.message.includes("cannot demote") || error.message.includes("Invalid role")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Deletes user account and cascaded relationship records.
 * @route DELETE /api/admin/users/:id
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = req.adminId!;
    const targetUserId = req.params.id as string;

    await adminUsersService.deleteUser(adminId, targetUserId);
    res.json({ success: true, message: "User deleted successfully." });
  } catch (error: any) {
    if (error.message.includes("cannot delete your own")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};
