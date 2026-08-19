import Salary from "../model/salaryModel.js";
import Employee from "../model/employeeModel.js";
import Intern from "../model/internModel.js";

// Admin adds a salary payment
const addPayment = async (req, res) => {
    const { payeeId, payeeModel, amount, month, year, remarks, paymentDate } = req.body;

    try {
        // Verify payee exists
        let payee;
        if (payeeModel === 'employee') {
            payee = await Employee.findById(payeeId);
        } else if (payeeModel === 'intern') {
            payee = await Intern.findById(payeeId);
        }

        if (!payee) {
            return res.status(404).json({ message: "Payee not found" });
        }

        const salary = await Salary.create({
            payeeId,
            payeeModel,
            amount,
            month,
            year,
            remarks,
            paymentDate: paymentDate || Date.now()
        });

        res.status(201).json(salary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get payment history for a specific member
const getPaymentHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const history = await Salary.find({ payeeId: id }).sort({ paymentDate: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin gets salary stats (spending per month/year)
const getSalaryStats = async (req, res) => {
    try {
        const stats = await Salary.aggregate([
            {
                $group: {
                    _id: {
                        year: "$year",
                        month: "$month",
                        payeeModel: "$payeeModel"
                    },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 }
            }
        ]);

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin/User gets all salary records (filtered by role in route if needed, or here)
const getAllSalaries = async (req, res) => {
    try {
        let query = {};

        // If not admin, only show their own
        if (req.user.role !== 'admin') {
            query.payeeId = req.user.id;
        }

        const salaries = await Salary.find(query).sort({ paymentDate: -1 });

        // Manually populate payee names for better performance/flexibility
        const records = await Promise.all(salaries.map(async (s) => {
            let payee;
            if (s.payeeModel === 'employee') {
                payee = await Employee.findById(s.payeeId).select('name');
            } else {
                payee = await Intern.findById(s.payeeId).select('name');
            }
            return {
                ...s._doc,
                payeeName: payee ? payee.name : 'Unknown'
            };
        }));

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { addPayment, getPaymentHistory, getSalaryStats, getAllSalaries };
