import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from 'dotenv'
// models/userModel.js

const Schema = mongoose.Schema;

const workExperienceSchema = new Schema({
  title: String,
  company: String,
  startDate: Date,
  endDate: Date,
  description: String,
});

const educationDetailsSchema = new Schema({
  degree: String,
  major: String,
  university: String,
  graduationDate: Date,
});

const certificationSchema = new Schema({
  name: String,
  organization: String,
  dateEarned: Date,
});

const socialLinksSchema = new Schema({
  portfolio: String,
  dribbble: String,
  behance: String,
});

const projectPreferencesSchema = new Schema({
  preferredIndustries: [String],
  preferredProjectTypes: [String],
});

const jobPreferencesSchema = new Schema({
  preferredCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  preferredSkills: [String],
  availability: String, // e.g., "Full-time", "Part-time"
  hourlyRate: Number,
});

const notificationSchema = new Schema({
  type: String, // e.g., "jobApplied", "paymentReceived"
  message: String,
  read: Boolean,
});
const testimonialSchema=new Schema({
  firstName:String,
  lastName:String,
  client_linkedIn_url:String,
  client_title:String,
  project_type:String,
  message:String,
  isApproved:{type:Boolean,default:false}

})

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String, // URL to profile picture
    emailVerified: Boolean,
    passwordResetToken: String,
    passwordResetExpires: Date,
    skills: [String],
    education: String,
    certifications: [certificationSchema],
    languages: [String],
    portfolio: String, // URL to portfolio
    isAvailable: Boolean,
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    earnings: Number,
    jobsCompleted: Number,
    hourlyRate:Number,
    location: String,
    timezone: String,
    socialLinks: socialLinksSchema,
    industry: String,
    workExperience: [workExperienceSchema],
    educationDetails: [educationDetailsSchema],
    jobPreferences: jobPreferencesSchema,
    testimonials:[testimonialSchema],
    isFeatured: Boolean,
    isVerified: Boolean,
    rating:Number
  },
  projectPreferences: projectPreferencesSchema,
  notifications: [notificationSchema],
  accountCreated: { type: Date, default: Date.now },
  isAccountActive: { type: Boolean, default: true }, // Indicates whether the user account is currently active
  accountDeactivationDate: { type: Date }, // Date when the account was deactivated, if applicable
  accountType: { type: String, enum: ['individual', 'company'] }, // Type of user account (individual or company)
  companyDetails: {
    companyName: String,
    companyRegistrationNumber: String,
    industry: String,
  },
  subscriptionPlan: { type: String }, // Name or identifier of the user's subscription plan
  subscriptionExpiryDate: { type: Date }, // Expiry date of the subscription plan
  isAdmin: { type: Boolean, default: false }, // Indicates whether the user has administrative privileges
  isSuspended: { type: Boolean, default: false }, // Indicates whether the user account is currently suspended

});



// Encrypting password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Return JWT Token
userSchema.methods.getJwtToken = function () {
 
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Gernerate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("User", userSchema);