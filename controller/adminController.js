import Admin from "../model/adminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Create a new Admin
const createAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (role !== "admin") {
            return res.status(400).json({ message: "Role must be admin" });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({ name, email, password: hashedPassword, role });
        await newAdmin.save();

        const { _id, createdAt, updatedAt } = newAdmin;
        res.status(201).json({ 
            message: "Admin created successfully", 
            admin: { _id, name, email, role, createdAt, updatedAt } 
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to create admin", error: error.message });
        console.error(error);
    }
};

// Admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Admin not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "2h" }
        );

        res.status(200).json({ 
            message: "Admin logged in successfully", 
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to login admin", error: error.message });
        console.error(error);
    }
};

// Get all admins (exclude passwords)
const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select("-password");
        res.status(200).json({ admins });
    } catch (error) {
        res.status(500).json({ message: "Failed to get admins", error: error.message });
        console.error(error);
    }
};

export { createAdmin, loginAdmin, getAdmins };
