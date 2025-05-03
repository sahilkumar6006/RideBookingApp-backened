import express from 'express';
import { AddLocation, getFavouriteLocation } from "../controllers/LocationController.js";

const router = express.Router();
console.log("Location routes hit");
// Add location
router.post('/', AddLocation);

// Get favorite locations
router.get('/favourite', getFavouriteLocation);

export default router;