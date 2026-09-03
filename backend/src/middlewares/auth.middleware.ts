import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const NEXT_JS_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const cookieHeader = req.headers.cookie;
    
    if (!cookieHeader) {
      return next();
    }

    const response = await fetch(`${NEXT_JS_URL}/api/auth/get-session`, {
      headers: {
        cookie: cookieHeader,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      if (data?.user?.id) {
        req.userId = data.user.id;
      }
    }

    next();
  } catch (error) {
    console.error("[Optional Auth Middleware Error]", error);
    next();
  }
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cookieHeader = req.headers.cookie;
    
    if (!cookieHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized: No cookies provided" });
    }

    const response = await fetch(`${NEXT_JS_URL}/api/auth/get-session`, {
      headers: {
        cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid session" });
    }

    const data = (await response.json()) as any;
    if (!data?.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: No active session found" });
    }

    req.userId = data.user.id;
    next();
  } catch (error) {
    console.error("[Require Auth Middleware Error]", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authorization.",
    });
  }
};
