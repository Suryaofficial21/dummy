import mongoose from "mongoose";

export const connectDatabase = () => {
let DB_URI = 'mongodb://localhost:27017/help-advice';


  mongoose.connect(DB_URI).then((con) => {
    console.log(
      `MongoDB Database connected with HOST: ${con?.connection?.host}`
    );
  });
};