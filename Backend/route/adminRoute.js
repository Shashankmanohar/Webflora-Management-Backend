import express from 'express';
import { createAdmin, loginAdmin, getAdmins } from '../controller/adminController.js';
import authMiddleware from '../middleware/auth.js';
const router = express.Router();


router.post('/register', authMiddleware(['admin']), createAdmin);
router.post('/login', loginAdmin);
router.get('/get', authMiddleware(['admin']), getAdmins);
export default router; 