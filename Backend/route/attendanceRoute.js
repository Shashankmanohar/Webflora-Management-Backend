import { Router } from 'express';
import {
    createAttendance,
    getAttendance,
    getAllAttendance,
    deleteAttendance
} from '../controller/attendanceController.js';
import authMiddleware from '../middleware/auth.js';


// Create a new router instance
const router = Router();

// Employee/Intern can mark their attendance
router.post('/create', authMiddleware(['employee', 'intern']), createAttendance);

// Employee/Intern can view their attendance records
router.get('/get', authMiddleware(['employee', 'intern']), getAttendance);

// Admin can view all attendance records
router.get('/all', authMiddleware(['admin']), getAllAttendance);

// Admin can delete an attendance record
router.delete('/delete/:id', authMiddleware(['admin']), deleteAttendance);

// Export the router
export default router;  