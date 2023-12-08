import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import { getContactusTemplate, getResetPasswordTemplate } from "../utils/emailTemplates.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { delete_file, upload_file } from "../utils/cloudinary.js";

// Register user   =>  /api/v1/register
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
  });

  sendToken(user, 201, res);
});

// Login user   =>  /api/v1/login
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
 console.log(email,password)
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter email & password",
    });
  }

  // Find user in the database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Check if password is correct
  const isPasswordMatched = await user.comparePassword(password);
 console.log(isPasswordMatched)
  if (!isPasswordMatched) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  sendToken(user, 200, res);
});

// Logout user   =>  /api/v1/logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    message: "Logged Out",
  });
});

// Upload user avatar   =>  /api/v1/me/upload_avatar
export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
  const avatarResponse = await upload_file(req.body.avatar, "india-produced/avatars");

  // Remove previous avatar
  if (req?.user?.avatar?.url) {
    await delete_file(req?.user?.avatar?.public_id);
  }

  const user = await User.findByIdAndUpdate(req?.user?._id, {
    avatar: avatarResponse,
  });

  res.status(200).json({
    user,
  });
});

// Forgot password   =>  /api/v1/password/forgot
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  // Find user in the database
  const user = await User.findOne({ email: req.body.email });
  let resetUrl
   console.log(req.body,user)
  if (!user && !req.body.name)  {
    return res.status(400).json({
      success: false,
      message: "User not found with this email",
    });
  }
  else{
  // Get reset password token
  if(user){
  const resetToken = user.getResetPasswordToken();

  await user.save();

  // Create reset password url
   resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  }}


  const message = getResetPasswordTemplate(user?.name, resetUrl);
  const contact =getContactusTemplate(req.body);
  try {
   
   
   if(req.body.name){
    await sendEmail({
      email:"indiaproducednetwork@gmail.com",
      user_name:req.body.name,
      subject: `New Contact Submission from ${req.body.name}`,
      message:contact,
    });
  }
  else{
    await sendEmail({
      email: user.email,
      subject: "India Produced - Password Recovery",
      message: message,
    });
  }
    res.status(200).json({
      message:!req.body.name? `Email sent to: ${user.email}`:`Contact form submitted successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return res.status(500).json({
      success: false,
      message: "Email could not be sent",
    });
  }
});

// Reset password   =>  /api/v1/password/reset/:token
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash the URL Token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Password reset token is invalid or has been expired",
    });
  }

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password does not match",
    });
  }

  // Set the new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Get current user profile  =>  /api/v1/me
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);

  res.status(200).json({
    user,
  });
});

// Update Password  =>  /api/v1/password/update
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id).select("+password");

  // Check the previous user password
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return res.status(400).json({
      success: false,
      message: "Old password is incorrect",
    });
  }

  user.password = req.body.password;
  user.save();

  res.status(200).json({
    success: true,
  });
});

// Update User Profile  =>  /api/v1/me/update
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
  });

  res.status(200).json({
    user,
  });
});

// Get all Users - ADMIN  =>  /api/v1/admin/users
export const allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    users,
  });
});

// Get User Details - ADMIN  =>  /api/v1/admin/users/:id
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found with this id",
    });
  }

  res.status(200).json({
    user,
  });
});

// Update User Details - ADMIN  =>  /api/v1/admin/users/:id
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
  });

  res.status(200).json({
    user,
  });
});

// Delete User - ADMIN  =>  /api/v1/admin/users/:id
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found with this id",
    });
  }

  // TODO - Remove user avatar from cloudinary

  await user.deleteOne();

  res.status(200).json({
    success: true,
  });
});