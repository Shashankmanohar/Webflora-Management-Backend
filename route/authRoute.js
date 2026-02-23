import express from "express";
import { forgotPassword, verifyOTP, resetPassword } from "../controller/authController.js";

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
