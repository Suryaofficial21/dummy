
// const mongoose = require('mongoose');

// const addProduct = new mongoose.Schema({


//     name: {
//       type: String,
//       required: true
//     },
  
//     price: {
//       type: Number,
//       required: true
//     },   quantity: {
//         type: Number,
//         required: true
//       },
//     image: {
//       type:String,
//       required:true
//     },
//     productId: {
//         type: Number,
//       },
//       size: {
//         type: Number,
//         required: true
//       },
//     color: {
//       type:String,
//       required:true
//     },



// });

// const RecentlyViewed = mongoose.model('AddProduct', addProduct);

// module.exports = RecentlyViewed;

import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  attributes: {
    name: { type: String, required: true },
    price: { type: Number},
    quantity: { type: String,},
    description: { type: String },
    rating: { type: Number },
    composition: { type: String },
    ufet: { type: String },
    benefits: { type: String },
    protips: { type: String },
    maintainence: { type: String },
    do: { type: String },
    dont: { type: String },
    material: { type: String },
    coating: { type: String },
    WidthDepth: { type: String },
    height: { type: String },
    weight: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date,default: Date.now },
    locale: { type: String },
    dimension: { type: String },
    style: { type: String },
    usage: { type: String },
    category: {type:String},
    subcategory: {type:String},
    care_directions: { type: String },
    image:{type: Array
    },
    sku:{type:String},
    origin:{type:String},
    quality:{type:String},
    flavours:{type:String},
    lifespan:{type:String},
    dishes:{type:String},
    numOfReviews:{
      type:Number,
      default:0
    }
    
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});


export default mongoose.model('Product', productSchema);


