import mongoose from "mongoose";
import products from "./data.js";
import Product from "../models/product.js";

const seedProducts = async () => {
  try {
    await mongoose.connect("mongodb+srv://ben999112:nMClLV2BqZ4SLI6V@india-produced.q5f2csk.mongodb.net/e-commerce?retryWrites=true&w=majority");

    await Product.deleteMany();

    await Product.insertMany(products);

    process.exit();
  } catch (error) {
    process.exit();
  }
};

seedProducts();