import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { Request, Response } from "express";
import userModel from "../models/user.model";
import jwt from "jsonwebtoken";
import validateFields from "../helpers/validateFields.helper";
import { promisify } from "util";
import jwtHelper from "../helpers/jwtHelper.helper";

// handle login
async function handleLogin(req: Request, res: Response) {
  // get email and password from body
  const { email, pass } = req.body;

  //   validate missing fields
  const hasError = validateFields({ email, pass }, res);
  if (hasError) return;

  // check for user in database
  const user = await userModel.findOne({ email: email }).exec();
  if (!user) return res.status(204).json({ message: "User not found" });

  //   compare password and send jwt if password matches
  const match = await bcrypt.compare(pass, user.password ?? "");

  if (match) {
    try {
      const roles = user.roles ? Object.values(user.roles) : [];
      const id = user._id;
      const email = user.email;
      const username = user.username;

      const accessSecret = process.env.ACCESS_TOKEN_SECRET;
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

      if (!accessSecret || !refreshSecret) {
        throw new Error("Token secrets not defined in environment variables");
      }
      // creating access token
      const accessToken = jwt.sign(
        {
          userInfo: {
            username: username,
            roles: roles,
          },
        },
        accessSecret,
        { expiresIn: "5m" }
      );

      // creating and saving refresh token in database
      const refreshToken = jwt.sign(
        {
          username: username,
        },
        refreshSecret,
        { expiresIn: "1d" }
      );

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ id, email, username, roles, accessToken });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Oops!!! something went wrong. Try again",
      });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Email and password does not match. Try again" });
  }
}

// handle refresh
async function handleRefresh(req: Request, res: Response) {
  try {
    // check for existing cookies in response cookie
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) return res.sendStatus(401);

    const verifyAsync = promisify(jwt.verify);

    // check for the user in database
    const user = await userModel.findOne({ refreshToken }).exec();
    if (!user) return res.sendStatus(403);

    const accessSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessSecret || !refreshSecret) {
      return res.sendStatus(500);
    }

    // verify if refresh token and refresh token secret match
    const decoded = await jwtHelper(refreshToken, refreshSecret);

    if (user.username !== decoded.username) {
      return res.sendStatus(403);
    }

    const roles = user.roles ? Object.values(user.roles) : [];

    const accessToken = jwt.sign(
      {
        userInfo: {
          username: user.username,
          roles: roles,
        },
      },
      accessSecret,
      { expiresIn: "5m" }
    );

    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      roles,
      accessToken,
    });
  } catch (error: any) {
    return res.sendStatus(403);
  }
}

// handle logout
async function handleLogout(req: Request, res: Response) {
  const cookie = req.cookies;
  if (!cookie?.jwt) return res.sendStatus(204);
  const refreshToken = cookie.jwt;

  //   check for refresh token in databse
  const user = await userModel.findOne({ refreshToken }).exec();
  if (!user) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    return res.sendStatus(204);
  }

  //   delete refresh token if found
  user.refreshToken = "";
  await user.save();

  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  return res.sendStatus(204);
}

export { handleLogin, handleRefresh, handleLogout };
