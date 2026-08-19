import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, "Email is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
    },
    role: {
        type: String,
        required: [true, "Role is required"],
    }
}, { timestamps: true });

const Admin = mongoose.model("admin", adminSchema);

export default Admin;