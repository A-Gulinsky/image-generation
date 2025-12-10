import express from "express";
import { generateImage } from "../controllers/googleGenController.js";
import { rateLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/get-ai-image", express.json(),rateLimiter, generateImage);

export default router;