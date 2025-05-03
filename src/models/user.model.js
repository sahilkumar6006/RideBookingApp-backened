import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    gender: {
        type: String,
        enum: ["MALE", "FEMALE", "OTHER"],
        required: true,
    },
    password: {
        type: String,
        required: false, // Will be set after OTP verification
    },
    profileImage: {
        type: String, // URL of the uploaded image
    },
    address: {
        type: String,
    },
    street: {
        type: String,
    },
    district: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    zipCode: {
        type: String,
    },
    age: {
        type: Number,
    },
    userType: {
        type: String,
        enum: ["RIDER", "DRIVER", "ADMIN"],
        required: false,
    },
    isVerified: {
        type: Boolean,
        default: false, // Becomes true after OTP verification
    },
    refreshToken: {
        type: String, // To manage JWT authentication
    },
    dateOfBirth: {
        type: Date,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    zipCode: {
        type: String,
    },
    vehicleDetails: {
        type: {
            make: String,
            model: String,
            year: String,
            color: String,
            licensePlate: String
        },
        required: false
    },
    drivingLicense: {
        type: String,
        required: false
    },
    rating: {
        type: Number,
        default: 0
    },
    totalRides: {
        type: Number,
        default: 0
    },
    accountStatus: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
        default: "ACTIVE"
    }
}, { timestamps: true });

// **🔐 Hash Password Before Saving**
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// **🛡️ Compare Password**
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// **🔑 Generate Access Token**
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
            userType: this.userType,
            isVerified: this.isVerified,
            profileImage: this.profileImage,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
    );
};

// **♻️ Generate Refresh Token**
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

export default mongoose.model("User", userSchema);
