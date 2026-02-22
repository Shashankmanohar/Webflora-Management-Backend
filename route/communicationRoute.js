import express from "express";
import {
  createCommunication,
  getCommunications,
  getCommunicationById,
  replyToCommunication,
  deleteCommunication
} from "../controller/communicationController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Employee/Intern creates a communication
router.post("/", authMiddleware(['employee', 'intern']), createCommunication);

// Unified listing for all roles (internal filtering applied in controller)
router.get("/", authMiddleware(['admin', 'employee', 'intern']), getCommunications);

// Employee/Admin gets a communication by id
router.get("/:id", authMiddleware(['employee', 'intern', 'admin']), getCommunicationById);

// Admin replies to a communication
router.put("/:id/reply", authMiddleware(['admin']), replyToCommunication);

// Admin deletes a communication
router.delete("/:id", authMiddleware(['admin']), deleteCommunication);

export default router;
