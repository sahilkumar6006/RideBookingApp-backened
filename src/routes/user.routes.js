import { Router } from "express";
import { 
    registerUser,
    loginUser,
    completeProfile,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Auth routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/logout").post(authMiddleware, logout);

// Profile routes
router.route("/complete-profile")
    .post(
        upload.single("profileImage"),
        completeProfile
    );

router.route("/update-profile")
    .put(
        authMiddleware,
        upload.single("profileImage"),
        updateProfile
    );

export default router;
