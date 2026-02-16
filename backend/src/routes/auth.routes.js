import express from "express";
import { body } from "express-validator";

import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import protect from "../middlewares/check-auth.js";

const router = express.Router();

const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Username must be at least 2 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
