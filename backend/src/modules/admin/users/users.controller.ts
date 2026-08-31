import type { Request, Response, NextFunction } from "express";
import * as adminUsersService from "./users.service.js";

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
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;

    const result = await adminUsersService.getUsers(skip, take, search, role, days);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

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
