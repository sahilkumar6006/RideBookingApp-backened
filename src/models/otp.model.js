import mongoose, {Schema} from "mongoose";

const otpSchema = new Schema({
  identifier: { // Can be email, phone, or any unique user field
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatically delete expired documents

export const OTP = mongoose.model("OTP", otpSchema);


