import { Router } from "express";
import {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
} from "../controllers/review.controller";
import catchAsync from "../helpers/catchAsync.helper";
import { upload } from "../middlewares/multer.middleware";

const reviewRouter = Router();

reviewRouter.get("/", catchAsync(getAllReviews));
reviewRouter.post("/create", upload.single("image"), catchAsync(createReview));
reviewRouter.put("/update", upload.single("image"), catchAsync(updateReview));
reviewRouter.delete("/delete", catchAsync(deleteReview));
reviewRouter.get("/:id", catchAsync(getReview));

export default reviewRouter;
