import express from "express";
import { newRating,getAllRatings,getProductRatings,updateRating,deleteRating } from "../controllers/ratingController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";
const router = express.Router();

router.route("/ratings/:productId").post(isAuthenticatedUser,newRating).get(getProductRatings).put(isAuthenticatedUser,updateRating);
router.route("/admin/ratings").get(isAuthenticatedUser,getAllRatings);
router.route("/ratings/:id").put(isAuthenticatedUser,updateRating).delete(isAuthenticatedUser,deleteRating);
export default router;