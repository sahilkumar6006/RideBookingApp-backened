import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
    },
    pickup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
    status: {
        type: String,
        enum: ["REQUESTED", "ACCEPTED", "STARTED", "COMPLETED", "CANCELLED"],
        default: "REQUESTED",
    },
    fare: {
        type: Number,
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "PENDING",
    },
    startTime: Date,
    endTime: Date,
}, { timestamps: true });

export const Ride = mongoose.model("Ride", rideSchema);
