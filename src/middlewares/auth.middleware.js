import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
    let token;
    
    // Try to get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.token) {
        // Try to get token from regular token header
        token = req.headers.token;
    } else {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    try {
        console.log("Token received:", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

        req.user = await User.findById(decoded._id).select("-password"); // Attach user data to request
        console.log("User found:", req.user);
        
        if (!req.user) {
            throw new ApiError(404, "User not found");
        }

        next();
    } catch (error) {
        console.error("Auth error:", error);
        throw new ApiError(401, "Invalid or expired token");
    }
};

export { authMiddleware };
