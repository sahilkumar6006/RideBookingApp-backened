import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Vehicle } from "../models/vehicle.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addVehicle = asyncHandler(async (req, res) => {
    const {
        driver,
        vehicleType,
        model,
        licensePlate,
        specifications,
        features,
    } = req.body;

    // Parse specifications and features from form data
    let parsedSpecifications;
    let parsedFeatures;

    try {
        // Parse specifications if it's a string
        parsedSpecifications = typeof specifications === 'string' 
            ? JSON.parse(specifications) 
            : specifications;

        // Parse features if it's a string
        parsedFeatures = typeof features === 'string' 
            ? JSON.parse(features) 
            : features;

    } catch (error) {
        throw new ApiError(400, "Invalid specifications or features format");
    }

    if (!driver || !vehicleType || !model || !licensePlate) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if vehicle with same license plate exists
    const existingVehicle = await Vehicle.findOne({ licensePlate });
    if (existingVehicle) {
        throw new ApiError(409, "Vehicle with this license plate already exists");
    }

    // Upload image if provided
    let imageUrl = '';
    if (req.files && req.files.image) {
        const result = await uploadOnCloudinary(req.files.image[0].path);
        imageUrl = result.secure_url;
    }

    // Upload documents if provided
    let documents = [];
    if (req.files && req.files.documents && req.files.documents.length > 0) {
        documents = await Promise.all(
            req.files.documents.map(async (file) => {
                const result = await uploadOnCloudinary(file.path);
                return result.secure_url;
            })
        );
    }

    // Log the data being sent to the database
    console.log("Adding vehicle with specifications:", parsedSpecifications);
    console.log("Adding vehicle with features:", parsedFeatures);

    const vehicle = await Vehicle.create({
        driver,
        vehicleType,
        model,
        licensePlate,
        image: imageUrl,
        documents,
        specifications: parsedSpecifications,
        features: parsedFeatures,
        isVerified: true,
    });

    // Format the response
    const formattedVehicle = {
        _id: vehicle._id,
        driver: vehicle.driver,
        vehicleType: vehicle.vehicleType,
        model: vehicle.model,
        licensePlate: vehicle.licensePlate,
        image: vehicle.image,
        specifications: {
            maxPower: vehicle.specifications?.maxPower || "N/A",
            fuel: vehicle.specifications?.fuel || "N/A",
            maxSpeed: vehicle.specifications?.maxSpeed || "N/A",
            zeroToSixty: vehicle.specifications?.zeroToSixty || "N/A"
        },
        features: {
            model: vehicle.features?.model || "N/A",
            capacity: vehicle.features?.capacity || "N/A",
            color: vehicle.features?.color || "N/A",
            fuelType: vehicle.features?.fuelType || "N/A",
            gearType: vehicle.features?.gearType || "N/A"
        },
        isVerified: vehicle.isVerified,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt
    };

    return res.status(201).json(
        new ApiResponse(201, formattedVehicle, "Vehicle added successfully")
    );
});

const updateVehicle = asyncHandler(async (req, res) => {
    const { vehicleId } = req.params;
    const {
        vehicleType,
        model,
        licensePlate,
        isVerified
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    // Update fields if provided
    if (vehicleType) vehicle.vehicleType = vehicleType;
    if (model) vehicle.model = model;
    if (licensePlate) vehicle.licensePlate = licensePlate;
    if (typeof isVerified === 'boolean') vehicle.isVerified = isVerified;

    // Handle new image if provided
    if (req.file) {
        const result = await uploadOnCloudinary(req.file.path);
        vehicle.image = result.secure_url;
    }

    // Handle new documents if provided
    if (req.files && req.files.length > 0) {
        const newDocuments = await Promise.all(
            req.files.map(async (file) => {
                const result = await uploadOnCloudinary(file.path);
                return result.secure_url;
            })
        );
        vehicle.documents = [...vehicle.documents, ...newDocuments];
    }

    await vehicle.save();

    return res.status(200).json(
        new ApiResponse(200, vehicle, "Vehicle updated successfully")
    );
});

const getAllVehicles = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, verified } = req.query;

    const query = {};
    if (typeof verified !== 'undefined') {
        query.isVerified = verified === 'true';
    }

    const vehicles = await Vehicle.find(query)
        .populate('driver', 'fullName email phone')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            vehicles,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalVehicles: total
            }
        }, "Vehicles retrieved successfully")
    );
});

const getVehicleById = asyncHandler(async (req, res) => {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId)
        .populate('driver', 'fullName email phone');

    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    return res.status(200).json(
        new ApiResponse(200, vehicle, "Vehicle retrieved successfully")
    );
});

const deleteVehicle = asyncHandler(async (req, res) => {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findByIdAndDelete(vehicleId);
    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Vehicle deleted successfully")
    );
});

export {
    addVehicle,
    updateVehicle,
    getAllVehicles,
    getVehicleById,
    deleteVehicle
}; 