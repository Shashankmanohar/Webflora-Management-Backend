import express from 'express';
import { addPayment, getPaymentHistory, getSalaryStats, getAllSalaries } from '../controller/salaryController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All salary routes are protected
router.post('/add', authMiddleware(['admin']), addPayment);
router.get('/history/:id', authMiddleware(['admin', 'employee', 'intern']), getPaymentHistory);
router.get('/all', authMiddleware(['admin', 'employee', 'intern']), getAllSalaries);
router.get('/stats', authMiddleware(['admin']), getSalaryStats);

export default router;
