// otpModel.js
import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema({
  title: { type: Number,required: true },
  publication: { type: Number,required: true },
  image:{type:String },
  tag:{type:String},
  content: { type: String },
});

export default mongoose.model('BlogSchema', BlogSchema);

