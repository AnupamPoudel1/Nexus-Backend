import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    roles: {
      admin: {
        type: Number,
        default: 548,
      },
    },
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", UserSchema);

export default userModel;
