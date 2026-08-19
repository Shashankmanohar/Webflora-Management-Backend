import Attendance from "../model/attendanceModel.js";
import Employee from "../model/employeeModel.js";
import Intern from "../model/internModel.js";

// Employee/Intern mark attendance
const createAttendance = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role; // 'employee' or 'intern'
    const { date, status, timeIn } = req.body;

    // Normalize date to YYYY-MM-DD for once-per-day check
    const normalizedDate = new Date(date).toISOString().split('T')[0];

    try {
        const existingAttendance = await Attendance.findOne({ userId, date: normalizedDate });
        if (existingAttendance) {
            return res.status(400).json({ message: "Attendance already marked for today" });
        }

        let user;
        if (userRole === 'employee') {
            user = await Employee.findById(userId);
        } else if (userRole === 'intern') {
            user = await Intern.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const attendance = await Attendance.create({
            userId,
            userModel: userRole,
            userName: user.name,
            userEmail: user.email,
            date: normalizedDate,
            status,
            timeIn
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// User views their own records
const getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ userId: req.user.id }).sort({ date: -1, createdAt: -1 });
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Admin gets all records (optionally filtered by userId)
const getAllAttendance = async (req, res) => {
    const { userId } = req.query;
    try {
        let query = {};
        if (userId) {
            query.userId = userId;
        }

        const attendance = await Attendance.find(query)
            .sort({ date: -1, createdAt: -1 })
            .populate({
                path: 'userId',
                select: 'name email'
            });

        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Admin deletes attendance record
const deleteAttendance = async (req, res) => {
    const { id } = req.params;
    try {
        const attendance = await Attendance.findByIdAndDelete(id);
        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found" });
        }
        res.status(200).json({ message: "Attendance record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createAttendance, getAttendance, getAllAttendance, deleteAttendance };
