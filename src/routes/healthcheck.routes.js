import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.controller.js"

const router = Router();

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Check if the API is running
 *     description: Returns a success message if the API is up and running
 *     tags: [Healthcheck]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 */
router.route('/').get(healthcheck);

export default router