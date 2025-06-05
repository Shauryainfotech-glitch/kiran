import { Request, Response, NextFunction } from "express";
import { ROLES, PERMISSIONS, hasPermission, Permission } from "@shared/rbac";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    permissions?: string[];
  };
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRole = req.user.role as any;
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ 
        message: "Insufficient permissions",
        required: permission,
        userRole: userRole
      });
    }

    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Insufficient role permissions",
        required: roles,
        userRole: req.user.role
      });
    }

    next();
  };
}

export function requireAdmin() {
  return requireRole(ROLES.ADMIN);
}

export function requireManagerOrAdmin() {
  return requireRole(ROLES.ADMIN, ROLES.MANAGER);
}