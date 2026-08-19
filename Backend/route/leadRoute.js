import express from "express";
import { createLead, getAllLeads, getLeadById, updateLead, deleteLead } from "../controller/leadController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authMiddleware(["admin"]), createLead);
router.get("/all", authMiddleware(["admin"]), getAllLeads);
router.get("/:id", authMiddleware(["admin"]), getLeadById);
router.put("/update/:id", authMiddleware(["admin"]), updateLead);
router.delete("/delete/:id", authMiddleware(["admin"]), deleteLead);

export default router;
