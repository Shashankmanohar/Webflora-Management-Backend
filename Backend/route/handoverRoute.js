import express from 'express';
import {
    createHandover,
    getAllHandovers,
    getHandoverById,
    updateHandover,
    deleteHandover
} from '../controller/handoverController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Only admin can create, update or delete handovers
router.post('/add', authMiddleware(['admin']), createHandover);
router.put('/update/:id', authMiddleware(['admin']), updateHandover);
router.delete('/delete/:id', authMiddleware(['admin']), deleteHandover);

// All roles can view (filtered by controller for non-admins)
router.get('/all', authMiddleware(['admin', 'employee', 'intern']), getAllHandovers);
router.get('/:id', authMiddleware(['admin', 'employee', 'intern']), getHandoverById);

export default router;
