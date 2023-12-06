// userActivityRoutes.js
import express from 'express';
import { isAuthenticatedUser } from '../middlewares/auth.js';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  addToRecentlyViewed,
  getRecentlyViewed,
  removeFromRecentlyViewed,
} from '../controllers/userActivityControllers.js'

const router = express.Router();

// Wishlist Endpoints
router.route('/wishlist')
  .post(isAuthenticatedUser, addToWishlist)
  .get(isAuthenticatedUser, getWishlist)
  .delete(isAuthenticatedUser, removeFromWishlist);

//Recently viewed Endpoints

router.route('/recently-viewed').get(isAuthenticatedUser, getRecentlyViewed).post(isAuthenticatedUser, addToRecentlyViewed).delete(isAuthenticatedUser, removeFromRecentlyViewed)




export default router;
