import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        }
    },
    city: String,
    state: String,
    country: String,
    pincode: String,
    isFavourite: {
        type: Boolean,
        default: false
    }
});

locationSchema.index({ coordinates: '2dsphere' });

export const Location = mongoose.model("Location", locationSchema);