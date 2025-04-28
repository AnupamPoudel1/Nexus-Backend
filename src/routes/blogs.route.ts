import { Router } from "express";
import {
  getAllBlogs,
  createNewBlog,
  updateBlog,
  deleteBlog,
  getBlog,
} from "../controllers/blog.controller";
import catchAsync from "../helpers/catchAsync.helper";

const blogRouter = Router();

blogRouter.get("/", catchAsync(getAllBlogs));
blogRouter.post("/create", catchAsync(createNewBlog));
blogRouter.put("/update", catchAsync(updateBlog));
blogRouter.delete("/delete", catchAsync(deleteBlog));
blogRouter.get("/getBlog/:slug", catchAsync(getBlog));

export default blogRouter;
