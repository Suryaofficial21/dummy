import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import {sendOtp} from '../controllers/otpControllers.js'
const router = express.Router();
router.route("/send-otp").post(sendOtp)
export default router
