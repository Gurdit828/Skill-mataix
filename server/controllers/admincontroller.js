import { User } from "../models/usermodel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { createCourse } from "./coursecontroller.js";

const isAdmin = (user) => user.role === "admin";

export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email."
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin"
        });
        return res.status(201).json({
            success: true,
            message: "Admin account created successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to register admin"
        });
    }
};

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }
        const user = await User.findOne({ email });
        if (!user || !isAdmin(user)) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });
        }
        generateToken(res, user, `Welcome back ${user.name}`);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to login admin"
        });
    }
};

export const logoutAdmin = async (_, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to logout"
        });
    }
};

export const getAdminProfile = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password");
        if (!user || !isAdmin(user)) {
            return res.status(404).json({
                message: "Admin profile not found",
                success: false
            });
        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to load admin profile"
        });
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { name } = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if (!user || !isAdmin(user)) {
            return res.status(404).json({
                message: "Admin not found",
                success: false
            });
        }
    
        // extract public id of the old image from the url if it exists;
        if (user.photoUrl) {
            const publicId = user.photoUrl.split("/").pop().split(".")[0]; // extract public id
            deleteMediaFromCloudinary(publicId);
        }

        // upload new photo
        const cloudResponse = await uploadMedia(profilePhoto.path);
        const photoUrl = cloudResponse.secure_url;

        const updatedData = { name, photoUrl };
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select("-password");

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Admin profile updated successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update admin profile"
        });
    }
};

export { createCourse };
