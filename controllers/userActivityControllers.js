// userActivityController.js (Controller)
import UserActivity from '../models/userActivity.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

export const addToWishlist = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  let userActivity = await UserActivity.findOne({ userId });

  if (!userActivity) {
    userActivity = new UserActivity({ userId, wishlist: [], recentlyViewed: [] });
  }

  if (userActivity.wishlist.includes(productId)) {
    res.status(403).json({ message: "Product is already in the wishlist." });
  }

  if (!userActivity.wishlist.includes(productId)) {
    userActivity.wishlist.push(productId);
    await userActivity.save();

    res.status(200).json({ message: 'Product added to wishlist successfully' });
  }
   
});

export const getWishlist = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  const userActivity = await UserActivity.findOne({ userId }).populate({
    path: 'wishlist',
    model: 'Product',
  });

  if (!userActivity) {
    return next(new ErrorHandler('Wishlist not found', 404));
  }

  res.status(200).json(userActivity.wishlist);
});

export const removeFromWishlist = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    const userActivity = await UserActivity.findOne({ userId });

    if (!userActivity) {
      return next(new ErrorHandler('User activity not found', 404));
    }

    if (!userActivity.wishlist.includes(productId)) {
      return next(new ErrorHandler("This product doesn't exist in the wishlist.", 403));
    }

    userActivity.wishlist = userActivity.wishlist.filter((id) => id.toString() !== productId);
    await userActivity.save();

    res.status(200).json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing product from wishlist', error });
  }
};

export const addToRecentlyViewed = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  let userActivity = await UserActivity.findOne({ userId });

  if (!userActivity) {
    userActivity = new UserActivity({ userId, wishlist: [], recentlyViewed: [] });
  }

  if (!userActivity.recentlyViewed.includes(productId)) {
    userActivity.recentlyViewed.push(productId);
    await userActivity.save();

    res.status(200).json({ message: 'Product added to recently viewed successfully' });
  } else {
 userActivity.recentlyViewed = userActivity.recentlyViewed.filter((id) => id.toString() !== productId);
 userActivity.recentlyViewed.push(productId);

    await userActivity.save();

    
    return next(new ErrorHandler("Product is already in the recently viewed list.", 403));
  }
});

export const getRecentlyViewed = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  const userActivity = await UserActivity.findOne({ userId }).populate({
    path: 'recentlyViewed',
    model: 'Product',
  });

  if (!userActivity) {
    return next(new ErrorHandler('Recently viewed items not found', 404));
  }

  const recentlyViewedWithWishlistStatus = userActivity.recentlyViewed
    .slice(-4)
    .reverse()
    .map((product) => ({
      ...product._doc,
      isInWishlist: userActivity.wishlist.includes(product._id.toString()),
    }));

  res.status(200).json(recentlyViewedWithWishlistStatus);
});


export const removeFromRecentlyViewed = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {
    const userActivity = await UserActivity.findOne({ userId });

    if (!userActivity) {
      return next(new ErrorHandler('User activity not found', 404));
    }

    if (!userActivity.recentlyViewed.includes(productId)) {
      return next(new ErrorHandler("This product doesn't exist in recently viewed items.", 403));
    }

    userActivity.recentlyViewed = userActivity.recentlyViewed.filter((id) => id.toString() !== productId);
    await userActivity.save();

    res.status(200).json({ message: 'Product removed from recently viewed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing product from recently viewed', error });
  }
};
