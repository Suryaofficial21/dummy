import Wishlist from "../models/wishlist.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
import Product from "../models/product.js";


export const addWishList = catchAsyncErrors(async (req, res,next) => {
  req.body.user = req.user._id;

  const userId = req.user._id
  const {productId}=req.body
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = new Wishlist({ userId, products: [] });
  }
  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();

  res.status(200).json({ message: 'Product added to wishlist successfully' });

  }
  
  if(wishlist.products.includes(productId)){
    return next(new ErrorHandler("Product is already added to wishlist.",403))
  }
  

});
export const getWishList = catchAsyncErrors(async (req, res) => {

req.body.user = req.user._id;

  const userId = req.user._id
  const wishlist = await Wishlist.findOne({ userId }).populate({
    path: 'products',
    model: 'Product',
  });
  if (!wishlist) {
    return next(new ErrorHandler('Wishlist not found',400))
  }
  res.status(200).json(wishlist.products);

});
export const removeFromWishlist = async (req,res,next) => {
const userId=req.user._id
const {productId}=req.body

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist){
      return next(new ErrorHandler('Wishlist not found',400))
    }
    if(!wishlist.products.includes(productId)){
      return next(new ErrorHandler("This product doesn't exist in wishlist.",403))
    }

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    res.status(200).json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing product from wishlist', error });
  }
}