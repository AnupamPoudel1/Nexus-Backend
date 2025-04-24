import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    image: {
      imageURL: {
        type: String,
        require: true,
      },
      public_id: {
        type: String,
        require: true,
      },
    },
    alt: {
      type: String,
      require: true,
    },
    fullName: {
      type: String,
      require: true,
    },
    statement: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const reviewModel = mongoose.model("Review", ReviewSchema);

export default reviewModel;
