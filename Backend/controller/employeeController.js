import Employee from "../model/employeeModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Salary from "../model/salaryModel.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

// Create employee
const createEmployee = async (req, res) => {
    try {
        const { name, email, password, role, phone, address, salary } = req.body;

        if (!name || !email || !password || !role || !phone || !address || !salary) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (role !== "employee") {
            return res.status(400).json({ message: "Role must be employee" });
        }

        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newEmployee = new Employee({
            name, email, password: hashedPassword, role, phone, address, salary
        });
        await newEmployee.save();

        // Send welcome email in background (Do not await to avoid Vercel timeouts)
        console.log(`Queueing welcome email for ${email}...`);
        sendWelcomeEmail(email, password, name, role)
            .then(result => {
                if (result.success) console.log(`Welcome email delivered to ${email}`);
                else console.error(`Failed to deliver welcome email to ${email}:`, result.error);
            })
            .catch(err => console.error("Email background error:", err));

        const { _id, createdAt, updatedAt } = newEmployee;
        res.status(201).json({
            message: "Employee created successfully",
            employee: { _id, name, email, role, phone, address, salary, createdAt, updatedAt }
        });

    } catch (error) {
        console.error("Error in createEmployee:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: "Failed to create employee", error: error.message });
    }
};

// Employee login
const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(400).json({ message: "Employee not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, employee.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: employee._id, role: employee.role },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(200).json({
            message: "Employee logged in successfully",
            token,
            employee: { id: employee._id, name: employee.name, email: employee.email, role: employee.role }
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to login employee", error: error.message });
        console.error(error);
    }
};

// Get all employees
const getEmployee = async (req, res) => {
    try {
        const employees = await Employee.aggregate([
            {
                $lookup: {
                    from: "salaries",
                    localField: "_id",
                    foreignField: "payeeId",
                    as: "payments"
                }
            },
            {
                $addFields: {
                    totalPaid: { $sum: "$payments.amount" }
                }
            },
            {
                $project: {
                    password: 0,
                    payments: 0
                }
            }
        ]);
        res.status(200).json({ employees });
    } catch (error) {
        res.status(500).json({ message: "Failed to get employees", error: error.message });
        console.error(error);
    }
};

// Admin update employee
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        let { name, email, password, role, phone, address, salary } = req.body;

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // If password is provided, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);
        }

        // Update fields (only if provided in req.body)
        employee.name = name || employee.name;
        employee.email = email || employee.email;
        employee.password = password || employee.password;
        employee.role = role || employee.role;
        employee.phone = phone || employee.phone;
        employee.address = address || employee.address;
        employee.salary = salary || employee.salary;

        await employee.save();

        const { _id, createdAt, updatedAt } = employee;
        res.status(200).json({
            message: "Employee updated successfully",
            employee: { _id, name: employee.name, email: employee.email, role: employee.role, phone: employee.phone, address: employee.address, salary: employee.salary, createdAt, updatedAt }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update employee", error: error.message });
        console.error(error);
    }
};

// Admin delete employee
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByIdAndDelete(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json({ message: "Employee deleted successfully", employee });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete employee", error: error.message });
        console.error(error);
    }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeData = await Employee.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "salaries",
                    localField: "_id",
                    foreignField: "payeeId",
                    as: "payments"
                }
            },
            {
                $addFields: {
                    totalPaid: { $sum: "$payments.amount" }
                }
            },
            {
                $project: {
                    password: 0,
                    payments: 0
                }
            }
        ]);

        if (!employeeData || employeeData.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json({ employee: employeeData[0] });
    } catch (error) {
        res.status(500).json({ message: "Failed to get employee", error: error.message });
        console.error(error);
    }
};

// List employees (Lightweight for selection)
const listEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({}, 'name role _id').lean();
        res.status(200).json({ employees });
    } catch (error) {
        res.status(500).json({ message: "Failed to list employees", error: error.message });
    }
};

export { createEmployee, loginEmployee, getEmployee, getEmployeeById, updateEmployee, deleteEmployee, listEmployees };
