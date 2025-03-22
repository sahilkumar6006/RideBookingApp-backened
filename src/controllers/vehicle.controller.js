import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Vehicle } from "../models/vehicle.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Fetch available cars with specifications and features
const getAvailableCars = asyncHandler(async (req, res) => {
    const cars = await Vehicle.find({ vehicleType: "CAR" })
        .select({
            _id: 1,
            model: 1,
            licensePlate: 1,
            image: 1,
            specifications: 1,
            features: 1,
            isVerified: 1
        })
        .populate('driver', 'fullName email phone');

    // Format the response
    const formattedCars = cars.map(car => ({
        _id: car._id,
        model: car.model,
        licensePlate: car.licensePlate,
        image: car.image,
        driver: car.driver,
        specifications: {
            maxPower: car.specifications?.maxPower || "N/A",
            fuel: car.specifications?.fuel || "N/A",
            maxSpeed: car.specifications?.maxSpeed || "N/A",
            zeroToSixty: car.specifications?.zeroToSixty || "N/A"
        },
        features: {
            model: car.features?.model || "N/A",
            capacity: car.features?.capacity || "N/A",
            color: car.features?.color || "N/A",
            fuelType: car.features?.fuelType || "N/A",
            gearType: car.features?.gearType || "N/A"
        },
        isVerified: car.isVerified
    }));

    return res.status(200).json(
        new ApiResponse(200, formattedCars, "Available cars fetched successfully")
    );
});

// enum: ["CAR", "BICYCLE", "TAXI", "CYCLE"],
// Fetch available bikes with specifications and features
const getAvailableBikes = asyncHandler(async (req, res) => {
    const bikes = await Vehicle.find({ vehicleType: "BICYCLE" })
        .select({
            _id: 1,
            model: 1,
            licensePlate: 1,
            image: 1,
            specifications: 1,
            features: 1,
            isVerified: 1
        })
        .populate('driver', 'fullName email phone');

    const formattedBikes = bikes.map(bike => ({
        _id: bike._id,
        model: bike.model,
        licensePlate: bike.licensePlate,
        image: bike.image,
        driver: bike.driver,
        specifications: {
            maxPower: bike.specifications?.maxPower || "N/A",
            fuel: bike.specifications?.fuel || "N/A",
            maxSpeed: bike.specifications?.maxSpeed || "N/A",
            zeroToSixty: bike.specifications?.zeroToSixty || "N/A"
        },
        features: {
            model: bike.features?.model || "N/A",
            capacity: bike.features?.capacity || "N/A",
            color: bike.features?.color || "N/A",
            fuelType: bike.features?.fuelType || "N/A",
            gearType: bike.features?.gearType || "N/A"
        },
        isVerified: bike.isVerified
    }));

    return res.status(200).json(
        new ApiResponse(200, formattedBikes, "Available bikes fetched successfully")
    );
});

// Fetch available cycles with specifications and features
const getAvailableCycles = asyncHandler(async (req, res) => {
    const cycles = await Vehicle.find({ vehicleType: "CYCLE" })
        .select({
            _id: 1,
            model: 1,
            licensePlate: 1,
            image: 1,
            specifications: 1,
            features: 1,
            isVerified: 1
        })
        .populate('driver', 'fullName email phone');

    const formattedCycles = cycles.map(cycle => ({
        _id: cycle._id,
        model: cycle.model,
        licensePlate: cycle.licensePlate,
        image: cycle.image,
        driver: cycle.driver,
        specifications: {
            maxPower: cycle.specifications?.maxPower || "N/A",
            fuel: cycle.specifications?.fuel || "N/A",
            maxSpeed: cycle.specifications?.maxSpeed || "N/A",
            zeroToSixty: cycle.specifications?.zeroToSixty || "N/A"
        },
        features: {
            model: cycle.features?.model || "N/A",
            capacity: cycle.features?.capacity || "N/A",
            color: cycle.features?.color || "N/A",
            fuelType: cycle.features?.fuelType || "N/A",
            gearType: cycle.features?.gearType || "N/A"
        },
        isVerified: cycle.isVerified
    }));

    return res.status(200).json(
        new ApiResponse(200, formattedCycles, "Available cycles fetched successfully")
    );
});

// Fetch available taxis with specifications and features
const getAvailableTaxis = asyncHandler(async (req, res) => {
    const taxis = await Vehicle.find({ vehicleType: "TAXI" })
        .select({
            _id: 1,
            model: 1,
            licensePlate: 1,
            image: 1,
            specifications: 1,
            features: 1,
            isVerified: 1
        })
        .populate('driver', 'fullName email phone');

    const formattedTaxis = taxis.map(taxi => ({
        _id: taxi._id,
        model: taxi.model,
        licensePlate: taxi.licensePlate,
        image: taxi.image,
        driver: taxi.driver,
        specifications: {
            maxPower: taxi.specifications?.maxPower || "N/A",
            fuel: taxi.specifications?.fuel || "N/A",
            maxSpeed: taxi.specifications?.maxSpeed || "N/A",
            zeroToSixty: taxi.specifications?.zeroToSixty || "N/A"
        },
        features: {
            model: taxi.features?.model || "N/A",
            capacity: taxi.features?.capacity || "N/A",
            color: taxi.features?.color || "N/A",
            fuelType: taxi.features?.fuelType || "N/A",
            gearType: taxi.features?.gearType || "N/A"
        },
        isVerified: taxi.isVerified
    }));

    return res.status(200).json(
        new ApiResponse(200, formattedTaxis, "Available taxis fetched successfully")
    );
});

// Add a new vehicle
const addVehicle = asyncHandler(async (req, res) => {
    const { driver, vehicleType, model, licensePlate } = req.body;

    // Validate required fields
    if (!driver || !vehicleType || !model || !licensePlate) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if vehicle with the same license plate exists
    const existingVehicle = await Vehicle.findOne({ licensePlate });
    if (existingVehicle) {
        throw new ApiError(409, "Vehicle with this license plate already exists");
    }

    // Create the vehicle
    const newVehicle = await Vehicle.create({
        driver,
        vehicleType,
        model,
        licensePlate,
    });

    return res.status(201).json({
        message: "Vehicle added successfully",
        vehicle: newVehicle,
    });
});

const getVehicleById = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    console.log(_id);

    const vehicle = await Vehicle.findById(_id);
    console.log(vehicle);
    
    if (!vehicle) {
        throw new ApiError(404, "Vehicle not found");
    }

    const formattedVehicle = {  
        _id: vehicle._id,
        model: vehicle.model,
        licensePlate: vehicle.licensePlate,
        image: vehicle.image,
        driver: vehicle.driver,
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
        isVerified: vehicle.isVerified  

    }

    return res.status(200).json(
        new ApiResponse(200, formattedVehicle, "Vehicle fetched successfully")
    );
});

export {
    getAvailableCars,
    getAvailableBikes,
    getAvailableCycles,
    getAvailableTaxis,
    addVehicle,
    getVehicleById
}; 