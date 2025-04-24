import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
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
    metaTitle: {
      type: String,
      require: true,
    },
    metaDescription: {
      type: String,
      require: true,
    },
    slug: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      require: true,
    },
    subHeading: {
      type: String,
      require: true,
    },
    content: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const blogModel = mongoose.model("Blog", BlogSchema);

export default blogModel;
