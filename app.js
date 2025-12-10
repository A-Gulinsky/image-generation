import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { checkAccessibility } from "./middlewares/accessibility.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN,
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: "Content-Type"
}));

app.use(express.json({ limit: "10mb" }));
app.set('trust proxy', 1);

app.use("/api", checkAccessibility, routes);
app.get("/", (req, res) => res.send("Server is running\n"));
app.use(errorHandler);

export default app;