import express from "express";
import { logActivity, getActivities, updateActivity, deleteActivity } from "../controller/activityController.js";
import authMiddleware from "../middleware/auth.js";

const activityRoutes = express.Router();

// Both Employees and Interns can log their activity
activityRoutes.post("/log", authMiddleware(['employee', 'intern']), logActivity);

// Employees and Interns can see their own, Admin can see everyone's
activityRoutes.get("/", authMiddleware(['admin', 'employee', 'intern']), getActivities);

// Update activity (Owner or Admin)
activityRoutes.patch("/update", authMiddleware(['admin', 'employee', 'intern']), updateActivity);

// Delete activity (Owner or Admin)
activityRoutes.delete("/delete", authMiddleware(['admin', 'employee', 'intern']), deleteActivity);

export default activityRoutes;
