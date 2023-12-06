import mongoose from "mongoose";

export const connectDatabase = () => {
let DB_URI = 'mongodb+srv://ben999112:nMClLV2BqZ4SLI6V@india-produced.q5f2csk.mongodb.net/e-commerce?retryWrites=true&w=majority';


  mongoose.connect(DB_URI).then((con) => {
    console.log(
      `MongoDB Database connected with HOST: ${con?.connection?.host}`
    );
  });
};