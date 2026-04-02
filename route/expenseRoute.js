import express from 'express';
import { createExpense, getExpenses, deleteExpense } from '../controller/expenseController.js';
import authMiddleware from '../middleware/auth.js';

import { upload } from '../middleware/upload.js';

const router = express.Router();

// Permissions
const allRoles = ['admin', 'employee', 'intern'];
const adminOnly = ['admin'];

router.post('/add', authMiddleware(allRoles), upload.single('receipt'), createExpense);
router.get('/all', authMiddleware(allRoles), getExpenses);
router.delete('/:id', authMiddleware(adminOnly), deleteExpense);

export default router;
