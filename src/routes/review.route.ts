import { Router } from "express";
import {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
} from "../controllers/review.controller";
import catchAsync from "../helpers/catchAsync.helper";

const reviewRouter = Router();

reviewRouter.get("/", catchAsync(getAllReviews));
reviewRouter.post("/create", catchAsync(createReview));
reviewRouter.put("/update", catchAsync(updateReview));
reviewRouter.delete("/delete", catchAsync(deleteReview));
reviewRouter.get("/:id", catchAsync(getReview));

export default reviewRouter;
