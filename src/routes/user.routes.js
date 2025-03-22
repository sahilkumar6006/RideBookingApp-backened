import { Router } from "express";
import { 
    registerUser,
    verifyOtp,
    setPassword,
    loginUser,
    completeProfile,
    updateProfile,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Auth routes
router.route("/register").post(registerUser);
router.route("/verify-otp").post(verifyOtp);
router.route("/set-password").post(setPassword);
router.route("/login").post(loginUser);
router.route("/resend-otp").post(resendOtp);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/logout").post(authMiddleware, logout);

// Profile routes
// router.route("/complete-profile").post(, completeProfile);
router.route("/complete-profile")
    .post(
        upload.single("profileImage"),
        completeProfile
    );

export default router;
