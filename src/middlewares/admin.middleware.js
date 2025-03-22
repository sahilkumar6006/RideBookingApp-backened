import { ApiError } from "../utils/ApiError.js";

const isAdmin = async (req, res, next) => {
    try {
        if (req.user.userType !== "ADMIN") {
            throw new ApiError(403, "Access denied. Admin only.");
        }
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Admin authentication failed");
    }
};

export { isAdmin }; 