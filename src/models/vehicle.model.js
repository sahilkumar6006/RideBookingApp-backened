import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    vehicleType: {
        type: String,
        enum: ["CAR", "BICYCLE", "TAXI", "CYCLE"],
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
    },
    documents: [{
        type: String, // URLs to vehicle documents
    }],
    isVerified: {
        type: Boolean,
        default: false,
    },
    specifications: {
        maxPower: {
            type: String, // e.g., "250hp"
        },
        fuel: {
            type: String, // e.g., "10km per litre"
        },
        maxSpeed: {
            type: String, // e.g., "230km/h"
        },
        zeroToSixty: {
            type: String, // e.g., "2.5 sec"
        },
    },
    features: {
        model: {
            type: String,
        },
        capacity: {
            type: String,
        },
        color: {
            type: String,
        },
        fuelType: {
            type: String,
        },
        gearType: {
            type: String,
        },
    },
}, { timestamps: true });

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);