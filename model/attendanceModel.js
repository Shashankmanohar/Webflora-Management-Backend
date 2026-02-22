import mongoose from "mongoose";

// Attendance model for any staff (Employee/Intern)
const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['employee', 'intern']
    },
    userName: {
        type: String,
        required: false,
    },
    userEmail: {
        type: String,
        required: false,
    },
    date: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        required: false,
        default: "absent",
        enum: ["present", "absent", "leave"],
    },
    timeIn: {
        type: Date,
        required: false,
    }
});

const Attendance = mongoose.model("attendance", attendanceSchema);

export default Attendance;