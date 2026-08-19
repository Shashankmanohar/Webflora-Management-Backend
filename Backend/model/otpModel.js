import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    otp: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "employee", "intern"],
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Document will be deleted when current time > expiresAt
    },
    attempts: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
