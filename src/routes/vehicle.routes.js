import { Router } from "express";
import {
    getAvailableCars,
    getAvailableBikes,
    getAvailableCycles,
    getAvailableTaxis,
    getVehicleById
} from "../controllers/vehicle.controller.js";
import multer from 'multer';
import { addVehicle, updateVehicle } from '../controllers/admin.vehicle.controller.js';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Set the destination for uploaded files

router.get("/vehicles/cars", getAvailableCars);
router.get("/vehicles/bikes", getAvailableBikes);
router.get("/vehicles/cycles", getAvailableCycles);
router.get("/vehicles/taxis", getAvailableTaxis);
router.get("/vehicles/:_id", getVehicleById);

export default router; 