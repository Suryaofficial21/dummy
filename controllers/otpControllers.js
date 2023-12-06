import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import otp from "../models/otp.js";
import TextFlow from "textflow.js";
import ErrorHandler from "../utils/errorHandler.js";
// Send OTP   =>  /api/v1/send-otp
TextFlow.useKey(process.env.TEXT_FLOW_API_KEY);
export const sendOtp = catchAsyncErrors(async (req, res, next) => {
  const { mobileNumber } = req.body;

  if (!mobileNumber) {
    return next(new ErrorHandler("Please enter mobile number", 400));
  }
 if(mobileNumber){
    TextFlow.sendVerificationSMS(Number(mobileNumber), 'Dear [User],Your One-Time Password (OTP) for logging into your INDIA PRODUCED account is:' , (err, data) => {
      if (err) {
        return next(new ErrorHandler(err.message, 400));
      }
      res.status(200).json({
        success: true,
        message: data,
      });
 })
 }

});
