import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
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
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
        minlength: [10, "Phone number must be 10 digit."]
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    salary: {
        type: Number,
        required: [true, "Salary is required"],
    },
}, { timestamps: true });

const Employee = mongoose.model("employee", employeeSchema);

export default Employee;