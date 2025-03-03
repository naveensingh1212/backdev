import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MONgodb connected !! DB Host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("mongodb connection error " , error);
        process.exit(1)
    }
}

export default connectDB



/**
 * Summary:
 * - Establishes a connection to MongoDB using Mongoose.
 * - Uses environment variables for the database URI and name.
 * - Logs a success message with the database host on successful connection.
 * - Catches connection errors and exits the process if the connection fails.
 */
