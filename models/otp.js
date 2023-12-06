// otpModel.js
import mongoose from 'mongoose'

const OtpSchema = new mongoose.Schema({
  mobileNumber: { type: Number,required: true },
  otp: { type: Number,required: true },
});

export default mongoose.model('Otp', OtpSchema);

