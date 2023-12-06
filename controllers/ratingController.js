import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Rating from "../models/rating.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create new Rating  =>  /api/v1/ratings/new
export const newRating = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const productId = req.params.productId;

  const existingRating = await Rating.findOne({ userId, productId });

  if (existingRating) {
    return res.status(400).json({
      success: false,
      message: "You have already rated this product",
    });
  }

  const newRating = await Rating.create({
    userId,
    productId,
    rating,
    comment,
  });

  // Calculate average rating and update product
  await updateProductRating(productId);

  res.status(201).json({
    rating: newRating,
  });
});
// Get ratings for a product  =>  /api/v1/ratings/:productId
export const getProductRatings = catchAsyncErrors(async (req, res, next) => {
  const productId = req.params.productId;
  // Get all ratings for the product
  const ratings = await Rating.find({ productId });

  // Calculate the average rating
  const totalRatings = ratings.length;
  const sumRatings = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

  // Populate user details for each rating
  const populatedRatings = await Rating.find({ productId }).populate("userId", "name");

  res.status(200).json({
    averageRating,
    totalRatings,
    ratings: populatedRatings,
  });
});


// Update Rating  =>  /api/v1/ratings/:id
export const updateRating = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const ratingId = req.params.productId;
  const updatedRating = await Rating.findByIdAndUpdate(
 ratingId,
    { rating, comment },
    { new: true, runValidators: true }
  );

  if (!updatedRating) {
    return res.status(400).json({
      success: false,
      message: "No rating found with this ID",
    });
  }

  // Calculate average rating and update product
  await updateProductRating(updatedRating.productId);

  res.status(200).json({
    rating: updatedRating,
  });
});

// Delete Rating  =>  /api/v1/ratings/:id
export const deleteRating = catchAsyncErrors(async (req, res, next) => {
  const ratingId = req.params.id;
  const deletedRating = await Rating.findByIdAndDelete(ratingId);

  if (!deletedRating) {
   return res.status(400).json({
      success: false,
      message: "No rating found with this ID",
    });
  }

  // Calculate average rating and update product
  await updateProductRating(deletedRating.productId);

  res.status(200).json({
    success: true,
  });
});

// Helper function to calculate average rating and update product
const updateProductRating = async (productId) => {
  const ratings = await Rating.find({ productId });

  const totalRatings = ratings.length;
  const sumRatings = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

  await Product.findByIdAndUpdate(
    productId,
    { "attributes.rating": averageRating, "attributes.numOfReviews": totalRatings },
    { new: true, runValidators: true }
  );
};
