import Admin from "../model/adminModel.js";
import Employee from "../model/employeeModel.js";
import Intern from "../model/internModel.js";
import OTP from "../model/otpModel.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Unified Global Login
const unifiedLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        let user = null;
        let role = "";
        console.log(`[LOGIN ATTEMPT] Email: "${email}", Role check: Admin/Employee/Intern`);

        // 1. Try Admin
        user = await Admin.findOne({ email: email.toLowerCase().trim() });
        if (user) {
            role = "admin";
            console.log(`[LOGIN ATTEMPT] Found Admin user: ${user.email}`);
        }

        // 2. Try Employee
        if (!user) {
            user = await Employee.findOne({ email: email.toLowerCase().trim() });
            if (user) {
                role = "employee";
                console.log(`[LOGIN ATTEMPT] Found Employee user: ${user.email}`);
            }
        }

        // 3. Try Intern
        if (!user) {
            user = await Intern.findOne({ email: email.toLowerCase().trim() });
            if (user) {
                role = "intern";
                console.log(`[LOGIN ATTEMPT] Found Intern user: ${user.email}`);
            }
        }

        if (!user) {
            console.log(`[LOGIN ATTEMPT] User not found for email: "${email}"`);
            return res.status(404).json({ message: "No account found with this email" });
        }

        // Verify password
        console.log(`[LOGIN ATTEMPT] Comparing received password: "${password}" (length: ${password ? password.length : 0}) with stored hash`);
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log(`[LOGIN ATTEMPT] Password verification for ${email}: ${isPasswordCorrect ? "SUCCESS" : "FAILED"}`);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role || role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "12h" }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role || role 
            }
        });

    } catch (error) {
        console.error("Unified Login Error:", error);
        res.status(500).json({ message: "Internal server error during login", error: error.message });
    }
};

// Helper to create transporter only when needed
const getTransporter = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const isPlaceholder = user?.includes('your-email') || pass?.includes('your-gmail-app-password');

    if (!user || !pass || isPlaceholder) {
        return null;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });
};

// Forgot Password - Send OTP
const forgotPassword = async (req, res) => {
    console.log("Forgot Password Request Received:", req.body);
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ message: "Email and role are required" });
        }

        // Validate if user exists based on role
        let user;
        if (role === "admin") user = await Admin.findOne({ email });
        else if (role === "employee") user = await Employee.findOne({ email });
        else if (role === "intern") user = await Intern.findOne({ email });

        if (!user) {
            console.log(`User not found: ${email} with role ${role}`);
            return res.status(404).json({ message: "No account found with this email" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

        // Store OTP in database
        try {
            await OTP.findOneAndUpdate(
                { email, role },
                { otp, expiresAt, attempts: 0 },
                { upsert: true, new: true }
            );
        } catch (dbError) {
            console.error("Database Error saving OTP:", dbError);
            return res.status(500).json({ message: "Failed to save verification code. Please try again." });
        }

        // Send Email Fallback for Dev
        console.log(`[DEV] OTP code for ${email}: ${otp}`);

        const transporter = getTransporter();

        if (!transporter) {
            console.warn("WARNING: Email service not configured. OTP logged to console above.");
            return res.status(200).json({
                message: "OTP generated (check server console)",
                dev_note: "Email service not configured in .env"
            });
        }

        const logoPath = path.join(__dirname, "../../frontend/public/webfloralogo.png");
        const blackLogoPath = path.join(__dirname, "../../frontend/public/Blacktextlogo.jpeg");

        const mailOptions = {
            from: `"Webflora Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Verification Code - Webflora",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; color: #333;">
                    <div style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 2px solid #ff4e1b;">
                        <img src="cid:webfloralogo" alt="Webflora Logo" style="max-height: 50px; width: auto; margin-bottom: 15px;">
                        <h2 style="margin: 0; color: #ffffff; font-size: 24px;">Verification Code</h2>
                    </div>
                    <div style="padding: 40px 30px; background-color: #ffffff; text-align: center;">
                        <p style="font-size: 16px; line-height: 1.6; color: #525f7f; margin-bottom: 30px;">
                            We received a request to reset your password. Please use the verification code below to proceed. 
                            <strong>This code is valid for 10 minutes.</strong>
                        </p>
                        <div style="background-color: #f1f3f9; padding: 25px; border-radius: 12px; display: inline-block; margin-bottom: 30px;">
                            <span style="font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #ff4e1b;">${otp}</span>
                        </div>
                        <p style="font-size: 14px; color: #8898aa; line-height: 1.6;">
                            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #adb5bd; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Webflora Technologies. All rights reserved.</p>
                        <p style="margin: 5px 0 0;">Best for Everyone</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: 'webfloralogo.png',
                    path: logoPath,
                    cid: 'webfloralogo'
                }
            ]
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: "OTP sent successfully to your email" });
        } catch (mailError) {
            console.error("Nodemailer Error:", mailError);
            res.status(200).json({
                message: "OTP generated but email failed to send (check console)",
                error: mailError.message
            });
        }

    } catch (error) {
        console.error("Critical Forgot Password Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otp, role } = req.body;
        if (!email || !otp || !role) return res.status(400).json({ message: "All fields are required" });

        const otpRecord = await OTP.findOne({ email, role });
        if (!otpRecord) return res.status(400).json({ message: "Invalid code or request expired" });

        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: "Code has expired" });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts = (otpRecord.attempts || 0) + 1;
            await otpRecord.save();
            if (otpRecord.attempts >= 3) {
                await OTP.deleteOne({ _id: otpRecord._id });
                return res.status(400).json({ message: "Too many failed attempts. Try again later." });
            }
            return res.status(400).json({ message: "Incorrect code" });
        }

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Verification failed", error: error.message });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, role, newPassword, otp } = req.body;
        if (!email || !role || !newPassword || !otp) return res.status(400).json({ message: "All fields are required" });

        const otpRecord = await OTP.findOne({ email, role, otp });
        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid session. Please start over." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        let user;
        if (role === "admin") user = await Admin.findOneAndUpdate({ email }, { password: hashedPassword });
        else if (role === "employee") user = await Employee.findOneAndUpdate({ email }, { password: hashedPassword });
        else if (role === "intern") user = await Intern.findOneAndUpdate({ email }, { password: hashedPassword });

        if (!user) return res.status(404).json({ message: "User not found" });

        await OTP.deleteOne({ _id: otpRecord._id });
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Reset failed", error: error.message });
    }
};

export { forgotPassword, verifyOTP, resetPassword, unifiedLogin };
