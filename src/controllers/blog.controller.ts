import blogModel from "../models/blog.model";
import crypto from "crypto";
import { Request, Response } from "express";
import validateFields from "../helpers/validateFields.helper";
import updateDocumentFields from "../helpers/updateDocumentFields.helper";
import uploadToCloudinary from "../helpers/uploadToCloudinary.helper";
import deleteFromCloudinary from "../helpers/deleteFromCloudinary.helper";

// get all blogs
async function getAllBlogs(req: Request, res: Response) {
  // page number and limit for pagination
  const page =
    typeof req.query.page === "string" ? parseInt(req.query.page) : 1;
  const limit =
    typeof req.query.limit === "string" ? parseInt(req.query.limit) : 10;
  const skip = (page - 1) * limit;

  // find blogs
  const blogs = await blogModel
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // if no blogs found
  if (blogs.length === 0) {
    return res.status(204).json({
      blogs: [],
      message: "No blogs found",
      currentPage: page,
      totalPages: 0,
      totalBlogs: 0,
    });
  }

  // if blogs found
  const totalBlogs = await blogModel.countDocuments();
  const totalPages = Math.ceil(totalBlogs / limit);

  res.status(200).json({
    blogs,
    currentPage: page,
    totalPages: totalPages,
    totalBlogs: totalBlogs,
  });
}

// create blogs
async function createNewBlog(req: Request, res: Response) {
  const {
    image,
    alt,
    metaTitle,
    metaDescription,
    slug,
    title,
    subHeading,
    content,
  } = req.body;

  //   validating missing fields
  const hasError = validateFields(
    {
      image,
      alt,
      metaTitle,
      metaDescription,
      slug,
      title,
      subHeading,
      content,
    },
    res
  );

  if (hasError) return;

  //   upload new blog to database
  try {
    // normalize slug
    const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    // checking for duplciate entries
    const existingBlog = await blogModel.findOne({ slug: normalizedSlug });
    if (existingBlog) {
      return res
        .status(409)
        .json({ message: "Blog with this slug already exists" });
    }

    const public_id = crypto.randomBytes(10).toString("hex");
    const imageURL = await uploadToCloudinary(image, public_id);

    await blogModel.create({
      image: {
        imageURL,
        public_id,
      },
      alt,
      metaTitle,
      metaDescription,
      slug: normalizedSlug,
      title,
      subHeading,
      content,
    });

    return res.status(201).json({ message: "New blog created successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Oops!! something went wrong. Try Again.",
    });
  }
}

// update blogs
async function updateBlog(req: Request, res: Response) {
  const {
    id,
    image,
    alt,
    metaTitle,
    metaDescription,
    slug,
    title,
    subHeading,
    content,
  } = req.body;

  //   validate missing fields
  const hasError = validateFields({ id }, res);

  if (hasError) return;

  //   find blog in database
  const blog = await blogModel.findById(id).exec();
  if (!blog) return res.status(204).json({ message: "Blog not found" });

  // update blog
  try {
    if (image) {
      const public_id = crypto.randomBytes(10).toString("hex");
      const imageURL = await uploadToCloudinary(image, public_id);

      blog.image = { imageURL, public_id };
    }

    if (slug) {
      const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

      const existingBlog = await blogModel.findOne({
        slug: normalizedSlug,
        _id: { $ne: id },
      });

      if (existingBlog) {
        return res
          .status(409)
          .json({ message: "Blog with this slug already exists" });
      }

      blog.slug = normalizedSlug;
    }

    updateDocumentFields(blog, {
      alt,
      metaTitle,
      metaDescription,
      title,
      subHeading,
      content,
    });

    await blog.save();

    return res.status(200).json({ message: "Blog updated successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Oops!!! something went wrong. Try again",
    });
  }
}

// delete blog
async function deleteBlog(req: Request, res: Response) {
  const { id } = req.body;

  //   validate missing fields
  const hasError = validateFields({ id }, res);
  if (hasError) return;

  // validate if blog exists
  const blog = await blogModel.findById(id).exec();
  if (!blog) return res.status(204).json({ message: "Blog not found" });

  // delete blog
  try {
    if (blog.image?.public_id) {
      await deleteFromCloudinary(blog.image.public_id);
    }

    await blogModel.deleteOne({ _id: id });

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Oops!!! somthing went wrong. Try again",
    });
  }
}

// find one blog
async function getBlog(req: Request, res: Response) {
  const { slug } = req.params;

  //   validate missing fields
  const hasError = validateFields({ slug }, res);

  if (hasError) return;

  try {
    const blog = await blogModel.findOne({ slug }).exec();

    if (!blog) return res.status(204).json({ message: "Blog not found" });

    return res.status(200).json(blog);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Opps!!! something went wrong. Try again",
    });
  }
}

export { getAllBlogs, createNewBlog, updateBlog, deleteBlog, getBlog };
