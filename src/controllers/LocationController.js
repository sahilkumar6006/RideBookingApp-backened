import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Location } from "../models/location.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const AddLocation = asyncHandler(async (req, res) => {
    try {
        console.log(req.body);
        const { address, street, district, city, state, country, pincode, isFavourite, coordinates } = req.body;
        
        // Validate required fields
        if (!address || !city || !state || !pincode) {
            throw new ApiError(400, "Address, city, state, and pincode are required");
        }

        try {
            console.log('Creating location with data:', {
                address,
                street,
                district,
                city,
                state,
                country,
                pincode,
                isFavourite: isFavourite || false,
                coordinates
            });
            
            // Create new location
            const location = await Location.create({
                address,
                street,
                district,
                city,
                state,
                country,
                pincode,
                isFavourite: isFavourite || false,
                coordinates
            });
            
            console.log('Location created successfully:', location);
            
            return res.status(201).json(
                new ApiResponse(
                    201, 
                    location, 
                    "Location added successfully"
                )
            );
        } catch (dbError) {
            console.error('Database error:', dbError);
            throw new ApiError(500, `Database error: ${dbError.message}`);
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new ApiError(400, error.message);
        }
        throw new ApiError(500, "Something went wrong while adding location");
    }
});

const getFavouriteLocation = asyncHandler(async (req, res) => {
    try {
        console.log('Getting favorite locations');
        
        try {
            const locations = await Location.find({ isFavourite: true });
            console.log('Favorite locations found:', locations);
            
            return res.status(200).json(
                new ApiResponse(
                    200, 
                    locations, 
                    "Favourite locations fetched successfully"
                )
            );
        } catch (dbError) {
            console.error('Database error while fetching favorite locations:', dbError);
            throw new ApiError(500, `Database error: ${dbError.message}`);
        }
    } catch (error) {
        console.error('Error in getFavouriteLocation:', error);
        throw new ApiError(500, "Something went wrong while fetching favourite locations");
    }
});


export {
    AddLocation,
    getFavouriteLocation
};