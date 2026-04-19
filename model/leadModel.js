import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
    leadName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    address: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["New", "Contacted", "Interested", "Closed", "Lost"],
        default: "New"
    },
    source: {
        type: String,
        default: ""
    },
    notes: {
        type: String,
        default: ""
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        required: true
    }
}, { timestamps: true });

export default mongoose.model("lead", leadSchema);
