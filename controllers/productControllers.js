import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";
import multer from "multer";
import path from "path";
import jwt from 'jsonwebtoken';
import User from "../models/user.js";
import UserActivity from "../models/userActivity.js";
// Create new Product   =>  /api/v1/products
export const getProducts = catchAsyncErrors(async (req, res, next) => {
  // Constants
  const resPerPage = 12;
  let skip = 0;
  const page = req.query.page || 1;
  const keyword = req.query.keyword;

  if (page > 1) {
    skip = (page - 1) * resPerPage;
  }

  // Get user ID from token (if available)
  const { token } = req.cookies;
  let userid = null;
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userid = decoded.id;
  }

  const apiFilters = new APIFilters(Product, req.query).search().filters();

  // Create a separate count query without pagination and other filters

  // Use lean() for query results
  let filteredProductsCount = await Product.find(apiFilters.query)
    .lean()
    .find({ "attributes.name": { $regex: new RegExp(keyword, 'i') } }).countDocuments();
  // Execute the count query to get the total count of products
  let products = await Product.find(apiFilters.query)
    .skip(skip) // Add skip for pagination
    .sort(apiFilters.sort)
    .limit(resPerPage)
    .lean()
    .find({ "attributes.name": { $regex: new RegExp(keyword, 'i') } })
  // Get user wishlist
  let wishlist = [];
  if (userid) {
    const userActivity = await UserActivity.findOne({ userId: userid });
    wishlist = userActivity ? userActivity.wishlist : [];
  }

  // Add information about whether each product is in the user's wishlist
  const productsWithWishlistInfo = products.map((product) => {
    const isInWishlist = wishlist?.includes(product._id.toString());
    return { ...product, isInWishlist };
  });

  // Send the response
  res.status(200).json({
    resPerPage,
    currentPage: page,
    filteredProductsCount,
    products: productsWithWishlistInfo,
  });
});



// Create new Product   =>  /api/v1/admin/products
export const newProduct = catchAsyncErrors(async (req, res) => {
  req.body.user = req.user._id;
  //const addedProducts = await Product.create(req.body);

  let id = 0
  const lastProduct = await Product.findOne({}, { id: 1 }, { sort: { id: -1 } });

  if (lastProduct) {
    id = lastProduct.id + 1;
  } else {
    id = 1;
  }


  if (Array.isArray(req.body)) {
    const productsWithUser = req.body.map(product => ({ ...product, user: req.user._id, id: id++ }));

    const addedProducts = await Product.insertMany(productsWithUser);
    res.status(200).json({ message: `${addedProducts.length} products added successfully` });
  } else {
    req.body.id = id
    const product = await Product.create(req.body);
    res.status(200).json({ product });
  }
});

// Get single product details   =>  /api/v1/products/:id
export const getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  console.log("working")

  let userid;
  if (token) {
  console.log("working")

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded)

    userid = await User.findById(decoded.id);
  }
  console.log("working")

  let wishlist = [];
  if (userid) {
    const userActivity = await UserActivity.findOne({ userId: userid });
    wishlist = userActivity ? userActivity.wishlist : [];
  }
  console.log("working")



  let isInWishlist = false

  const product = await Product.findById(req?.params?.id).populate(
    // "reviews.user"
  );
  if (wishlist.includes(product._id.toString())) {
    isInWishlist = true
  }

  console.log("working")

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    product,
    isInWishlist
  });
});

// Get products - ADMIN   =>  /api/v1/admin/products
export const getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    products,
  });
});
// Set up Multer storage for saving files locally
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where you want to store the files locally
    cb(null, '/public');
  },
  filename: (req, file, cb) => {
    // Customize the filename if needed; you can use the original name or generate a unique name
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });
// Update product details   =>  /api/v1/products/:id
export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  // Multer middleware to handle image upload
  console.log("working")
  upload.single('image')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return next(new ErrorHandler('Multer error', 400));
    } else if (err) {
      return next(new ErrorHandler(err.message, 400));
    }
    console.log("working")

    // Now you can handle the updated request
    try {
      let product = await Product.findById(req.params.id);
      console.log("working")


      if (!product) {
        return next(new ErrorHandler('Product not found', 404));
      }
      console.log("working")

      // Update attributes
      product.attributes.updatedAt = new Date();

      // Check if an image was uploaded
      if (req.file) {
        // Save the image path in the 'attributes' object
        const path = req.file.path;
        product.attributes.image.push(path);
      }
      console.log("working")

      // Combine existing attributes with the updated ones
      const combinedObject = { ...product.attributes, ...req.body.attributes };

      // Update the product
      product = await Product.findByIdAndUpdate(
        req.params.id,
        { attributes: combinedObject },
        { new: true }
      );

      res.status(200).json({
        product,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, 500));
    }
  });
});
// Upload product images   =>  /api/v1/admin/products/:id/upload_images
export const uploadProductImages = catchAsyncErrors(async (req, res) => {
  let product = await Product.findById(req?.params?.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const uploader = async (image) => upload_file(image, "shopit/products");

  const urls = await Promise.all((req?.body?.images).map(uploader));

  product?.images?.push(...urls);
  await product?.save();

  res.status(200).json({
    product,
  });
});

// Delete product image   =>  /api/v1/admin/products/:id/delete_image
export const deleteProductImage = catchAsyncErrors(async (req, res) => {
  let product = await Product.findById(req?.params?.id)
  product.attributes.image.splice(req.body.index, 1)
  await product.save()


  // if (!product) {
  //   return next(new ErrorHandler("Product not found", 404));
  // }

  // const isDeleted = await delete_file(req.body.imgId);

  // if (isDeleted) {
  //   product.images = product?.images?.filter(
  //     (img) => img.public_id !== req.body.imgId
  //   );

  //   await product?.save();
  // }

  res.status(200).json({
    product,
  });
});

// Delete product   =>  /api/v1/products/:id
export const deleteProduct = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req?.params?.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Deleting image associated with product
  for (let i = 0; i < product?.images?.length; i++) {
    await delete_file(product?.images[i].public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    message: "Product Deleted",
  });
});

// Create/Update product review   =>  /api/v1/reviews
export const createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req?.user?._id,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const isReviewed = product?.reviews?.find(
    (r) => r.user.toString() === req?.user?._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review?.user?.toString() === req?.user?._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get product reviews   =>  /api/v1/reviews
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    reviews: product.reviews,
  });
});

// Delete product review   =>  /api/v1/admin/reviews
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product?.reviews?.filter(
    (review) => review._id.toString() !== req?.query?.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    numOfReviews === 0
      ? 0
      : product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      numOfReviews;

  product = await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, numOfReviews, ratings },
    { new: true }
  );

  res.status(200).json({
    success: true,
    product,
  });
});

// Can user review   =>  /api/v1/can_review
export const canUserReview = catchAsyncErrors(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    "orderItems.product": req.query.productId,
  });

  if (orders.length === 0) {
    return res.status(200).json({ canReview: false });
  }

  res.status(200).json({
    canReview: true,
  });
});

// Get recently added products   =>  /api/v1/products/recently-added
export const getRecentProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 4;
  const { token } = req.cookies;
  let userid;
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userid = await User.findById(decoded.id);
  }
  let wishlist = [];
  if (userid) {
    const userActivity = await UserActivity.findOne({ userId: userid });
    wishlist = userActivity ? userActivity.wishlist : [];
  }

  let query = Product.find();

  query = query.sort({ "attributes.createdAt": -1 });

  const currentPage = Number(req.query.page) || 1;
  const skip = resPerPage * (currentPage - 1);
  query = query.limit(resPerPage).skip(skip);

  const products = await query;

  // Add isInWishlist key to each product
  const productsWithWishlistStatus = products.map((product) => ({
    ...product._doc,
    isInWishlist: wishlist.includes(product._id.toString()),
  }));

  res.status(200).json({
    resPerPage,
    recentProductsCount: products.length,
    products: productsWithWishlistStatus,
  });
});
