import { Router } from "express";
import {
    createRating,
    updateRating,
    deleteRating,
    getRatingsByUser,
    getRideRating
} from "../controllers/rating.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all routes with authentication
router.use(verifyJWT);

// Rating routes
router.post("/", createRating);
router.patch("/:ratingId", updateRating);
router.delete("/:ratingId", deleteRating);
router.get("/user/:userId", getRatingsByUser);
router.get("/ride/:rideId", getRideRating);

export default router;