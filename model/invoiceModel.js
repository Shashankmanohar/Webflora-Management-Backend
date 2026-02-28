import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "client",
        required: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
        required: true,
    },
    referenceNo: {
        type: String,
        required: true,
    },
    invoiceNo: {
        type: String,
        required: true,
        default: "",
        unique: true
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    method: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Card", "Cheque"], required: true },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["pending", "paid", "overdue"],
        default: "pending"
    },
    previousDue: {
        type: Number,
        default: 0
    },
    dueBreakdown: [
        {
            projectName: String,
            amount: Number
        }
    ]

})

export default mongoose.model("invoice", invoiceSchema);