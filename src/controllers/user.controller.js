import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import User from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { generateOtp,verifyOtpCheck } from "./otp.controller.js";
import bcrypt from "bcrypt";
import { OTP } from "../models/otp.model.js"
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return {accessToken, refreshToken}
    } catch (error) {User
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
const registerUser = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, phone, gender, userType } = req.body;

        if ([fullName, email, phone, gender, userType].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        // Check if user already exists
        const existedUser = await User.findOne({
            $or: [{ phone }, { email }]
        });

        if (existedUser) {
            // If user exists, check for OTP expiration
            const otpRecord = await OTP.findOne({ phone });
            if (otpRecord && otpRecord.expiresAt > Date.now()) {
                throw new ApiError(409, "User with email or phone already exists. OTP is still valid.");
            } else {
                // OTP expired, resend OTP
                const otp = await generateOtp(phone);
                return res.status(200).json(new ApiResponse(200, { otp }, "OTP resent successfully"));
            }
        }
        const user = await User.create({ fullName, email, phone, gender, userType });
        const otp = await generateOtp(phone);
        return res.status(201).json(new ApiResponse(201, { user, otp }, "User registered successfully"));
    } catch (error) {
        console.error("Error in registerUser:", error); 
        return res.status(500).json({ error: "Internal server error" });
    }
});


const verifyOtp = async (req, res) => {
    console.log("Request Body:", req.body);

    if (!req.body || !req.body.otp || !req.body.identifier) {
        return res.status(400).json({ error: "Invalid request" });
    }
       const { identifier, otp } = req.body;
    try {
        const isOtpValid = await verifyOtpCheck(identifier, otp);
        console.log("Is OTP Valid:", isOtpValid);
        
        if (isOtpValid) {
            console.log("Generating session token...");

            // Use a static secret key for now
            const staticSecretKey = "your_static_secret_key"; // Replace with your desired static key

            const sessionToken = jwt.sign(
                { identifier },
                staticSecretKey, // Use the static key here
                { expiresIn: "10m" }
            );
            console.log("Session Token:", sessionToken);
            return res.status(200).json({
                message: "OTP verified successfully",
                sessionToken,
            });
        } else {
            return res.status(400).json({ error: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


const setPassword = async (req, res) => {
    const { sessionToken, password } = req.body;

    console.log("Received sessionToken:", sessionToken);
    if (!sessionToken || !password) {
        return res.status(400).json({ error: "Session token and password are required" });
    }

    const staticSecretKey = "your_static_secret_key"; // Ensure this is consistent
    try {
        // Verify the session token
        const decoded = jwt.verify(sessionToken, staticSecretKey);
        const { identifier } = decoded;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password in the database
        const user = await User.findOneAndUpdate(
            { $or: [{ email: identifier }, { phone: identifier }] },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "Password set successfully" });
    } catch (error) {
        console.error("Error during session token verification:", error);
        return res.status(400).json({ error: "Invalid or expired session token" });
    }
};



const completeProfile = asyncHandler(async (req, res) => {
    try {
        // Add validation for userId
        const { userId } = req.body;
        
        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }

        console.log("Received userId:", userId); // Debug log

        // Validate that userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user ID format");
        }

        // Rest of your existing code...
        const { address, age, street, district, city, state, zipCode } = req.body;
        
        let imageUrl;
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (!uploadResult) {
                throw new ApiError(400, "Error while uploading profile image");
            }
            imageUrl = uploadResult.secure_url;
        }

        const updateFields = {
            ...(imageUrl && { profileImage: imageUrl }),
            ...(address && { address }),
            ...(age && { age: Number(age) }),
            ...(street && { street }),
            ...(district && { district }),
            ...(city && { city }),
            ...(state && { state }),
            ...(zipCode && { zipCode })
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(200, updatedUser, "Profile completed successfully")
        );

    } catch (error) {
        console.error("Complete profile error:", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Error while completing profile"
        );
    }
});


 const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1️⃣ Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 2️⃣ Find user in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3️⃣ Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 4️⃣ Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // 5️⃣ Save refreshToken in DB
        user.refreshToken = refreshToken;
        await user.save();

        // 6️⃣ Return tokens to client
        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                userType: user.userType,
                profileImage: user.profileImage,
                address: user.address,
                age: user.age,
                street: user.street,
                district: user.district,
                city: user.city,
                state: user.state,
                zipCode: user.zipCode,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


const updateProfile = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    try {
        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Get updated fields from request
        const { fullName, phone, address } = req.body;
        let imageUrl = user.profileImage; // Keep existing image if not updated

        // Handle profile image upload
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            imageUrl = uploadResult.secure_url;
        }

        // Update user data
        user.fullName = fullName || user.fullName;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.profileImage = imageUrl;

        await user.save();

        return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
});

const resendOtp = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        throw new ApiError(400, "Phone number is required");
    }

    const user = await User.findOne({ phone });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Generate new OTP
    const otp = await generateOtp(phone);

    return res.status(200).json(
        new ApiResponse(200, { otp }, "OTP resent successfully")
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        throw new ApiError(400, "Phone number is required");
    }

    const user = await User.findOne({ phone });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Generate OTP for password reset
    const otp = await generateOtp(phone);

    return res.status(200).json(
        new ApiResponse(200, { otp }, "Password reset OTP sent successfully")
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }

    // Verify OTP
    const isOtpValid = await verifyOtpCheck(phone, otp);
    if (!isOtpValid) {
        throw new ApiError(400, "Invalid OTP");
    }

    // Update password
    const user = await User.findOne({ phone });
    user.password = newPassword;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successful")
    );
});

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        }
    );

    return res.status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export {
    registerUser,
    verifyOtp,
    setPassword,
    completeProfile,
    loginUser,
    updateProfile,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout
}
