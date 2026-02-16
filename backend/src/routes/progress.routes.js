import express from "express";

import { getDashboardData } from "../controllers/progress.controller.js";
import protect from "../middlewares/check-auth.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardData);

export default router;
