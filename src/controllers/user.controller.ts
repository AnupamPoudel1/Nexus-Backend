import { Request, Response } from "express";
import userModel from "../models/user.model";
import bcrypt from "bcrypt";
import validateFields from "../helpers/validateFields.helper";

// get all users
async function getAllUsers(req: Request, res: Response) {
  // page number and limit for pagination
  const page =
    typeof req.query.page === "string" ? parseInt(req.query.page) : 1;
  const limit =
    typeof req.query.limit === "string" ? parseInt(req.query.limit) : 10;
  const skip = (page - 1) * limit;

  // find users in database
  const users = await userModel
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // if no users found
  if (users.length === 0) {
    return res.status(204).json({
      users: [],
      message: "No users found",
      currentPage: page,
      totalPages: 0,
      totalUsers: 0,
    });
  }

  // if users found
  const totalUsers = await userModel.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit);

  return res.status(200).json({
    users,
    currentPage: page,
    totalPages: totalPages,
    totalUsers: totalUsers,
  });
}

// create user
async function createUser(req: Request, res: Response) {
  // get email and pass from body
  const { username, email, password } = req.body;

  // validate missing fields
  const hasError = validateFields({ username, email, password }, res);
  if (hasError) return;

  //   checking for duplicate entries
  const duplicate = await userModel.findOne({ email: email }).exec();
  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Email already exists. User another email" });
  }

  //   create new user
  try {
    const encryptedPass = await bcrypt.hash(password, 10);

    await userModel.create({
      username,
      password: encryptedPass,
    });

    return res.status(201).json({ message: "New user created successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Oops!!! something went wrong. Try again",
    });
  }
}

// change password
async function changeUserPass(req: Request, res: Response) {
  // get user id and new password from body
  const { id, currentPass, newPass } = req.body;

  //   validate missing fields
  const hasError = validateFields({ id, currentPass, newPass }, res);
  if (hasError) return;

  //   find admin in database
  const user = await userModel.findById(id).exec();
  if (!user) return res.status(204).json({ message: "Could not verify user" });

  //   match old password
  const match = await bcrypt.compare(currentPass, user.password ?? "");
  if (!match) {
    return res.status(204).json({ message: "Current password does not match" });
  }

  try {
    const encryptedPass = await bcrypt.hash(newPass, 10);

    user.password = encryptedPass;
    await user.save();

    return res.status(200).json({ message: "Passwor updated successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Oops!!! something went wrong. Try again" });
  }
}

// delete user
async function deleteUser(req: Request, res: Response) {
  //   get user id
  const { id } = req.body;

  //   validate missing fields
  const hasError = validateFields({ id }, res);
  if (hasError) return;

  //  find admin in databases
  const user = await userModel.findById(id).exec();
  if (!user) return res.status(204).json({ message: "User not found" });

  // delete user
  try {
    await userModel.deleteOne({ _id: id });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Oops!!! something went wrong. Try again",
    });
  }
}

export { getAllUsers, createUser, changeUserPass, deleteUser };
