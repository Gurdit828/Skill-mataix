import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();


// Call database connection here
connectDB();

// Initialize the Express app
const app = express();

// Define the PORT variable before using it
const PORT =  8000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Default middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173", // Update this to your frontend URL
    credentials: true
}));

// APIs
app.use("/api/v2/media", mediaRoute);
app.use("/api/v2/user", userRoute);
app.use("/api/v2/course", courseRoute);
app.use("/api/v2/purchase", purchaseRoute);
app.use("/api/v2/progress", courseProgressRoute);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});