import { Request, Response } from "express";
import reviewModel from "../models/review.model";
import validateFields from "../helpers/validateFields.helper";
import uploadToCloudinary from "../helpers/uploadToCloudinary.helper";
import crypto from "crypto";
import updateDocumentFields from "../helpers/updateDocumentFields.helper";
import deleteFromCloudinary from "../helpers/deleteFromCloudinary.helper";

// get all reviews
async function getAllReviews(req: Request, res: Response) {
  // page number and limit for pagination
  const page =
    typeof req.query.page === "string" ? parseInt(req.query.page) : 1;
  const limit =
    typeof req.query.limit === "string" ? parseInt(req.query.limit) : 10;
  const skip = (page - 1) * limit;

  // search for reviews in database
  const reviews = await reviewModel
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (reviews.length === 0) {
    return res.status(204).json({
      reviews: [],
      message: "No reviews found",
      currentPage: page,
      totalPage: 0,
      totalReviews: 0,
    });
  }

  const totalReviews = await reviewModel.countDocuments();
  const totalPages = Math.ceil(totalReviews / limit);

  return res.status(200).json({
    reviews,
    currentPage: page,
    totalPages: totalPages,
    totalReviews: totalReviews,
  });
}

// create new reviews
async function createReview(req: Request, res: Response) {
  const { image, alt, fullName, statement } = req.body;

  //   validate missing fields
  const hasError = validateFields({ image, alt, fullName, statement }, res);

  if (hasError) return;

  try {
    const public_id = crypto.randomBytes(10).toString("hex");
    const imageURL = await uploadToCloudinary(image, public_id);

    await reviewModel.create({
      image: {
        imageURL,
        public_id,
      },
      alt,
      fullName,
      statement,
    });

    return res.status(201).json({ message: "New review created successfuly" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Oops!!! somethign went wrong. Try again",
    });
  }
}

// update reviews
async function updateReview(req: Request, res: Response) {
  const { id, image, alt, fullName, statement } = req.body;

  //   validate missing fields
  const hasError = validateFields({ id }, res);

  if (hasError) return;

  //   find review in database
  const review = await reviewModel.findById(id).exec();
  if (!review) return res.status(204).json({ message: "Review not found" });

  //   update review
  try {
    if (image) {
      const public_id = crypto.randomBytes(10).toString("hex");
      const imageURL = await uploadToCloudinary(image, public_id);

      review.image = { imageURL, public_id };
    }

    updateDocumentFields(review, {
      alt,
      fullName,
      statement,
    });

    await review.save();

    return res.status(200).json({ message: "Review updated successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Oops!!! something went wrong. Try again",
    });
  }
}

// delete review
async function deleteReview(req: Request, res: Response) {
  const { id } = req.body;

  //   validate missing fields
  const hasError = validateFields({ id }, res);
  if (hasError) return;

  //  find review in databse
  const review = await reviewModel.findById(id).exec();
  if (!review) return res.json(204).json({ message: "Review not found" });

  // delete review
  try {
    if (review.image?.public_id) {
      await deleteFromCloudinary(review.image.public_id);
    }

    await reviewModel.deleteOne({ _id: id });

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Oops!!! something went wrong. Try again",
    });
  }
}

// find one review
async function getReview(req: Request, res: Response) {
  const { id } = req.body;

  //   validate missing fields
  const hasError = validateFields({ id }, res);
  if (hasError) return;

  //   get review
  try {
    const review = await reviewModel.findById(id).exec();
    if (!review) return res.status(204).json({ message: "Review not found" });

    return res.status(200).json(review);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Oops!!! something went wrong. Try again",
    });
  }
}

export = { getAllReviews, createReview, updateReview, deleteReview, getReview };
