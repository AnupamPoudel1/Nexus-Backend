import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    require: true,
  },
  roles: {
    admin: {
      type: Number,
      default: 548,
    },
  },
});

const userModel = mongoose.model("User", UserSchema);

export default userModel;
