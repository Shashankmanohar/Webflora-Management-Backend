import express from "express";
import { getAttendanceReport, getSalaryReport } from "../controller/reportController.js";
import authMiddleware from "../middleware/auth.js";

const reportRoutes = express.Router();

// Attendance Report (Admins see everyone's, User see own)
reportRoutes.get("/attendance", authMiddleware(['admin', 'employee', 'intern']), getAttendanceReport);

// Salary Report (Admins see everyone's, User see own)
reportRoutes.get("/salary", authMiddleware(['admin', 'employee', 'intern']), getSalaryReport);

export default reportRoutes;
