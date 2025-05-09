import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/userroute.js";
import courseRoute from "./routes/courseroute.js";
import mediaRoute from "./routes/mediaroute.js";
import purchaseRoute from "./routes/purchaseCourseroute.js";

import courseProgressRoute from "./routes/courseProgressroute.js";
import mongoose from "mongoose";
// import adminRoute from "./routes/admin.route.js";

// Load environment variables
dotenv.config();

// Call database connection here
connectDB();

// Initialize the Express app
const app = express();

// Define the PORT variable before using it
const PORT =  8000;

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

//app.use("/api/v2/admin", adminRoute);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
