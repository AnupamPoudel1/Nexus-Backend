import { NextFunction, Request, Response } from "express";

export default function verifyRoles(...allowedRoles: number[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles: number[] = req.roles || [];

    if (userRoles.length === 0) {
      return res.sendStatus(401); // Unauthorized
    }

    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return res.sendStatus(403); // Forbidden (you have roles, but not enough permission)
    }

    next();
  };
}
