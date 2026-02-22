import express from "express";
import {
    createNotice,
    getOneNotice,
    getNotices,
    deleteNotice
} from "../controller/noticeController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Admin can create notice
router.post("/create", authMiddleware(["admin"]), createNotice);

// Admin, Employee & Intern can view all notices
router.get("/get", authMiddleware(["admin", "employee", "intern"]), getNotices);

// Admin, Employee & Intern can view a single notice by id
router.get("/get/:id", authMiddleware(["admin", "employee", "intern"]), getOneNotice);

// Admin can delete notice
router.delete("/delete/:id", authMiddleware(["admin"]), deleteNotice);

export default router;
