import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded._id).select("-password"); // Attach user data to request
        if (!req.user) throw new ApiError(404, "User not found");

        next();
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
};

export { authMiddleware };
