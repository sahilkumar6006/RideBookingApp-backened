import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    addVehicle,
    updateVehicle,
    getAllVehicles,
    getVehicleById,
    deleteVehicle
} from "../controllers/admin.vehicle.controller.js";

const router = Router();

// No authentication middleware applied

router.route("/")
    .post(upload.fields([
        { name: "image", maxCount: 1 },
        { name: "documents", maxCount: 5 }
    ]), addVehicle)
    .get(getAllVehicles);

router.route("/:vehicleId")
    .get(getVehicleById)
    .patch(upload.fields([
        { name: "image", maxCount: 1 },
        { name: "documents", maxCount: 5 }
    ]), updateVehicle)
    .delete(deleteVehicle);

export default router; 