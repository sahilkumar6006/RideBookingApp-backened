import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    console.log(req.body);
    try {
        const { fullName, email, phone, gender, userType, password } = req.body;

        // Validate required fields
        if ([fullName, email, phone, gender, userType, password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        // Check if user already exists
        const existedUser = await User.findOne({
            $or: [{ phone }, { email }]
        });

        if (existedUser) {
            throw new ApiError(409, "User with email or phone already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with password
        const user = await User.create({ 
            fullName, 
            email, 
            phone, 
            gender, 
            userType, 
            password: hashedPassword 
        });

        // Generate tokens
        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        // Return user without sensitive information
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        return res.status(201).json(
            new ApiResponse(
                201, 
                { user: createdUser, accessToken, refreshToken }, 
                "User registered successfully"
            )
        );
    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(error.statusCode || 500).json({ 
            error: error.message || "Internal server error" 
        });
    }
});

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check password
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //     return res.status(400).json({ message: "Invalid credentials" });
        // }

        // Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save refreshToken in DB
        user.refreshToken = refreshToken;
        await user.save();

        // Return tokens to client
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

const completeProfile = asyncHandler(async (req, res) => {
    try {
        // Extract user ID from authentication
        // const authHeader = req.headers.authorization;
        // if (!authHeader || !authHeader.startsWith("Bearer ")) {
        //     throw new ApiError(401, "Unauthorized: No token provided");
        // }
        
        // // Extract token
        // const token = authHeader.split(" ")[1];
        
        // // Verify JWT
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // const userId = decoded._id;

        // Rest of your existing code...
        const { address, age, street, district, city, state, zipCode, fullName, phone } = req.body;
        
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
            ...(zipCode && { zipCode }),
            ...(fullName && { fullName }),
            ...(phone && { phone })
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

const updateProfile = asyncHandler(async (req, res) => {
    try {
        console.log("Update profile controller hit");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        console.log("Request user:", req.user);

        // Get user ID from the request (authMiddleware already attaches it)
        const userId = req.user._id;

        console.log(" req.body ID:",  req.body);
        // Extract all possible fields from request body
        const updateFields = {
            fullName: req.body.fullName,
            phone: req.body.phone,
            address: req.body.address,
            age: req.body.age ? parseInt(req.body.age) : undefined,
            street: req.body.street,
            district: req.body.district,
            city: req.body.city,
            state: req.body.state,
            zipCode: req.body.zipCode
        };

        let imageUrl;
        if (req.file) {
            console.log("Received file for upload:", req.file);
            try {
                const uploadResult = await uploadOnCloudinary(req.file.path);
                if (!uploadResult) {
                    throw new Error("Cloudinary returned null response");
                }
                imageUrl = uploadResult.secure_url;
                console.log("Profile image uploaded successfully:", imageUrl);
                updateFields.profileImage = imageUrl; // Update the profileImage field with the Cloudinary URL
            } catch (error) {
                console.error("Error uploading profile image:", error);
                throw new ApiError(
                    500,
                    `Failed to upload profile image: ${error.message}`
                );
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        if (!updatedUser) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(200, updatedUser, "Profile updated successfully")
        );
    } catch (error) {
        console.error("Update profile error:", error);
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Error while updating profile"
        );
    }
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Generate a password reset token
    const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return res.status(200).json(
        new ApiResponse(200, { resetToken }, "Password reset token generated successfully")
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }

    try {
        // Verify reset token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        const user = await User.findByIdAndUpdate(
            decoded.userId,
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(200, {}, "Password reset successful")
        );
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
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
    loginUser,
    completeProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    logout
}