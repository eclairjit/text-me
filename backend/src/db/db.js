import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}${DB_NAME}`
    );

    console.log(
      `MongoDB connection successful. DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`Error in connecting to MongoDB. Error: ${error.message}`);
    process.exit(1);
  }
};

export default dbConnect;
