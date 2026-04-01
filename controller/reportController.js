import Attendance from "../model/attendanceModel.js";
import Salary from "../model/salaryModel.js";
import Employee from "../model/employeeModel.js";
import Intern from "../model/internModel.js";

// Get Attendance Report Data
const getAttendanceReport = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { userId, startDate, endDate } = req.query;

        let query = {};

        if (role !== 'admin') {
            // Non-admin can only see their own attendance
            query.userId = id;
        } else if (userId) {
            // Admin can filter by userId
            query.userId = userId;
        }

        if (startDate && endDate) {
            // Simple date filtering (Attendance stores date as a string "YYYY-MM-DD")
            query.date = { $gte: startDate, $lte: endDate };
        }

        const attendance = await Attendance.find(query).sort({ date: -1 });
        res.status(200).json({ attendance });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch attendance report", error: error.message });
    }
};

// Get Salary Report Data
const getSalaryReport = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { payeeId, month, year } = req.query;

        let query = {};

        if (role !== 'admin') {
            // Non-admin can only see their own salary
            query.payeeId = id;
        } else if (payeeId) {
            // Admin can filter by payeeId
            query.payeeId = payeeId;
        }

        if (month) query.month = month;
        if (year) query.year = year;

        const salaries = await Salary.find(query).sort({ createdAt: -1 });
        res.status(200).json({ salaries });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch salary report", error: error.message });
    }
};

export { getAttendanceReport, getSalaryReport };
