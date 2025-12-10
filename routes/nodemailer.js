import express from "express";
import { sendMailController } from "../controllers/nodemailerController.js";
import { rateLimiter } from "../middlewares/rateLimit.js";
import multer from "multer";
const upload = multer();

const router = express.Router();

router.post("/get-email", upload.none(), sendMailController);

export default router;