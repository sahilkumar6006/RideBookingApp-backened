import { Router } from "express";
import {
    getAvailableCars,
    getAvailableBikes,
    getAvailableCycles,
    getAvailableTaxis,
    getVehicleById
} from "../controllers/vehicle.controller.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Vehicle:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the vehicle
 *         type:
 *           type: string
 *           enum: [car, bike, cycle, taxi]
 *           description: Type of the vehicle
 *         model:
 *           type: string
 *           description: Model of the vehicle
 *         make:
 *           type: string
 *           description: Manufacturer of the vehicle
 *         year:
 *           type: integer
 *           description: Manufacturing year
 *         color:
 *           type: string
 *           description: Color of the vehicle
 *         pricePerHour:
 *           type: number
 *           format: float
 *           description: Rental price per hour
 *         available:
 *           type: boolean
 *           description: Availability status
 *         imageUrl:
 *           type: string
 *           description: URL of the vehicle image
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: List of features
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         type: "car"
 *         model: "Model S"
 *         make: "Tesla"
 *         year: 2023
 *         color: "Red"
 *         pricePerHour: 49.99
 *         available: true
 *         imageUrl: "https://example.com/tesla.jpg"
 *         features: ["GPS", "Bluetooth", "Air Conditioning"]
 */

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle management endpoints
 */

/**
 * @swagger
 * /vehicles/cars:
 *   get:
 *     summary: Get all available cars
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: List of available cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */
router.get("/vehicles/cars", getAvailableCars);

/**
 * @swagger
 * /vehicles/bikes:
 *   get:
 *     summary: Get all available bikes
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: List of available bikes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */
router.get("/vehicles/bikes", getAvailableBikes);

/**
 * @swagger
 * /vehicles/cycles:
 *   get:
 *     summary: Get all available cycles
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: List of available cycles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */
router.get("/vehicles/cycles", getAvailableCycles);

/**
 * @swagger
 * /vehicles/taxis:
 *   get:
 *     summary: Get all available taxis
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: List of available taxis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */
router.get("/vehicles/taxis", getAvailableTaxis);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get a vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Vehicle not found
 */
router.get("/vehicles/:_id", getVehicleById);

// Add tags for Swagger UI
export const vehicleTags = [
  {
    name: 'Vehicles',
    description: 'Vehicle management endpoints'
  }
];

export default router; 