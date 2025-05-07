import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {

        console.log(`MongoDB URI is ${process.env.MONGO_URI}`);
        console.log("Connecting to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        })

        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed", error.message);
    }
}


export default connectDB;