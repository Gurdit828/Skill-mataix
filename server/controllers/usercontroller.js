import {User} from "../models/usermodel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const register = async (req,res) => {
    try {
       
        const {name, email, password} = req.body; // gurdit214
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"User already exist with this email."
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password:hashedPassword
        });
        return res.status(201).json({
            success:true,
            message:"Account created successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to register"
        })
    }
}
export const login = async (req,res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }

        // Check if login is for admin from env variables
        if(email === process.env.ADMIN_EMAIL){
            if(password === process.env.ADMIN_PASSWORD){
                // Create admin user object
                const adminUser = {
                    _id: "admin-id",
                    name: "Admin",
                    email: process.env.ADMIN_EMAIL,
                    role: "admin"
                };
                // Create welcome message
                const welcomeMessage = `Welcome back Admin ${adminUser.name}`;
                generateToken(res, adminUser, welcomeMessage);
                return;
            } else {
                return res.status(400).json({
                    success:false,
                    message:"Incorrect email or password"
                });
            }
        }

        // Normal user login flow
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            });
        }
        // Sanitize user object to exclude password before sending
        const userData = user.toObject();
        delete userData.password;

        // Create role-based welcome message
        let welcomeMessage = `Welcome back ${user.name}`;
        if(user.role === "admin"){
            welcomeMessage = `Welcome back Admin ${user.name}`;
        } else if(user.role === "instructor"){
            welcomeMessage = `Welcome back Instructor ${user.name}`;
        } else if(user.role === "student"){
            welcomeMessage = `Welcome back Student ${user.name}`;
        }

        generateToken(res, userData, welcomeMessage);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to login"
        })
    }
}
export const logout = async (_,res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge:0}).json({
            message:"Logged out successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to logout"
        }) 
    }
}
export const getUserProfile = async (req,res) => {
    try {
        const userId = req.id;
        console.log("getUserProfile called with userId:", userId);
        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        if(!user){
            return res.status(404).json({
                message:"Profile not found",
                success:false
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        return res.status(500).json({
            success:false,
            message:"Failed to load user"
        })
    }
}
export const updateProfile = async (req,res) => {
    try {
        const userId = req.id;
        const {name} = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            }) 
        }
        // extract public id of the old image from the url if it exists;
        if(user.photoUrl){
            const publicId = user.photoUrl.split("/").pop().split(".")[0]; // extract public id
            await deleteMediaFromCloudinary(publicId);
        }

        // upload new photo if provided
        let photoUrl;
        if(profilePhoto){
            const cloudResponse = await uploadMedia(profilePhoto.path);
            photoUrl = cloudResponse.secure_url;
        }

        const updatedData = {name};
        if(photoUrl) updatedData.photoUrl = photoUrl;

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

        return res.status(200).json({
            success:true,
            user:updatedUser,
            message:"Profile updated successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to update profile"
        });
    }
}
