import { NextFunction, Request, Response } from "express";
import jwtHelper from "../helpers/jwtHelper.helper";

declare module "express-serve-static-core" {
  interface Request {
    user?: string;
    roles?: number[];
  }
}

async function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (
    !authHeader ||
    typeof authHeader !== "string" ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.sendStatus(401); // Unauthorized
  }

  const token = authHeader.split(" ")[1];
  const accessSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!accessSecret) {
    console.error("ACCESS_TOKEN_SECRET is not defined");
    return res.sendStatus(500); // Internal Server Error
  }

  const decoded = await jwtHelper(token, accessSecret);

  const userInfo = decoded.userInfo || (decoded as any).UserInfo;

  if (!userInfo?.username || !userInfo?.roles) {
    return res.sendStatus(403);
  }

  req.user = userInfo.username;
  req.roles = userInfo.roles;

  next();
}

export { verifyJWT };
