import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Rating } from "../models/rating.model.js";
import { User } from "../models/user.model.js";

const createRating = asyncHandler(async (req, res) => {
    const { ride, ratedTo, rating, comment } = req.body;

    // Validate required fields
    if (!ride || !ratedTo || !rating) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Check if user has already rated this ride
    const existingRating = await Rating.findOne({
        ride,
        ratedBy: req.user._id
    });

    if (existingRating) {
        throw new ApiError(400, "You have already rated this ride");
    }

    // Create rating
    const newRating = await Rating.create({
        ride,
        ratedBy: req.user._id,
        ratedTo,
        rating,
        comment
    });

    // Calculate and update user's average rating
    const userRatings = await Rating.find({ ratedTo });
    const averageRating = userRatings.reduce((acc, curr) => acc + curr.rating, 0) / userRatings.length;
    
    await User.findByIdAndUpdate(ratedTo, {
        $set: { averageRating: Number(averageRating.toFixed(1)) }
    });

    return res.status(201).json(
        new ApiResponse(201, newRating, "Rating created successfully")
    );
});

const updateRating = asyncHandler(async (req, res) => {
    const { ratingId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating range
    if (rating && (rating < 1 || rating > 5)) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Find and verify ownership
    const existingRating = await Rating.findById(ratingId);

    if (!existingRating) {
        throw new ApiError(404, "Rating not found");
    }

    if (existingRating.ratedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this rating");
    }

    // Update rating
    const updatedRating = await Rating.findByIdAndUpdate(
        ratingId,
        {
            $set: {
                rating: rating || existingRating.rating,
                comment: comment || existingRating.comment
            }
        },
        { new: true }
    );

    // Recalculate average rating
    const userRatings = await Rating.find({ ratedTo: existingRating.ratedTo });
    const averageRating = userRatings.reduce((acc, curr) => acc + curr.rating, 0) / userRatings.length;
    
    await User.findByIdAndUpdate(existingRating.ratedTo, {
        $set: { averageRating: Number(averageRating.toFixed(1)) }
    });

    return res.status(200).json(
        new ApiResponse(200, updatedRating, "Rating updated successfully")
    );
});

const deleteRating = asyncHandler(async (req, res) => {
    const { ratingId } = req.params;

    const rating = await Rating.findById(ratingId);

    if (!rating) {
        throw new ApiError(404, "Rating not found");
    }

    if (rating.ratedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this rating");
    }

    await Rating.findByIdAndDelete(ratingId);

    // Recalculate average rating
    const userRatings = await Rating.find({ ratedTo: rating.ratedTo });
    const averageRating = userRatings.length 
        ? userRatings.reduce((acc, curr) => acc + curr.rating, 0) / userRatings.length
        : 0;
    
    await User.findByIdAndUpdate(rating.ratedTo, {
        $set: { averageRating: Number(averageRating.toFixed(1)) }
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Rating deleted successfully")
    );
});

const getRatingsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ ratedTo: userId })
        .populate("ratedBy", "fullName profileImage")
        .populate("ride", "pickup destination")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalRatings = await Rating.countDocuments({ ratedTo: userId });

    return res.status(200).json(
        new ApiResponse(200, {
            ratings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalRatings / limit),
                totalRatings
            }
        }, "Ratings retrieved successfully")
    );
});

const getRideRating = asyncHandler(async (req, res) => {
    const { rideId } = req.params;

    const rating = await Rating.findOne({ ride: rideId })
        .populate("ratedBy", "fullName profileImage")
        .populate("ratedTo", "fullName profileImage")
        .populate("ride", "pickup destination");

    if (!rating) {
        throw new ApiError(404, "Rating not found for this ride");
    }

    return res.status(200).json(
        new ApiResponse(200, rating, "Rating retrieved successfully")
    );
});

export {
    createRating,
    updateRating,
    deleteRating,
    getRatingsByUser,
    getRideRating
};