import crypto from "crypto";
import { OTP } from "../models/otp.model.js";

const generateOtp = async (identifier) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  const expiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  // Store OTP in the database
  await OTP.create({ identifier, otp, expiresAt });

  // Send OTP via SMS or Email (implement your sending logic here)
  return otp;
};


const verifyOtpCheck = async (identifier, otp) => {
  console.log("🔍 Checking OTP for identifier:", identifier);
  console.log("🔍 Received OTP:", otp);

  // Find the OTP record for the identifier (phone or email)
  const otpRecord = await OTP.findOne({
    identifier: String(identifier),
    otp: String(otp),
  });

  console.log("📝 Matched OTP Record:", otpRecord);

  if (!otpRecord) {
    throw new Error("Invalid OTP");
  }

  // Check if the OTP has expired
  if (otpRecord.expiresAt < Date.now()) {
    throw new Error("Expired OTP");
  }

  await OTP.deleteOne({ _id: otpRecord._id });
  return true;
};


export  { generateOtp , verifyOtpCheck};
