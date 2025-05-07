import { Router } from "express";
import {
  getAllBlogs,
  createNewBlog,
  updateBlog,
  deleteBlog,
  getBlog,
} from "../controllers/blog.controller";
import catchAsync from "../helpers/catchAsync.helper";
import { upload } from "../middlewares/multer.middleware";

const blogRouter = Router();

blogRouter.get("/", catchAsync(getAllBlogs));
blogRouter.post("/create", upload.single("image"), catchAsync(createNewBlog));
blogRouter.put("/update", upload.single("image"), catchAsync(updateBlog));
blogRouter.delete("/delete", catchAsync(deleteBlog));
blogRouter.get("/:slug", catchAsync(getBlog));

export default blogRouter;
