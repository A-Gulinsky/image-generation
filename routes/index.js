import express from "express";
import googleGenRoutes from "./google-gen-ai.js";
import mailRoutes from "./nodemailer.js";

const router = express.Router();

router.use("/", googleGenRoutes);
router.use("/", mailRoutes);

export default router;