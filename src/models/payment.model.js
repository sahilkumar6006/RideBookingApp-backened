import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["CASH", "CARD", "UPI"],
        required: true,
    },
    transactionId: {
        type: String,
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "PENDING",
    },
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);