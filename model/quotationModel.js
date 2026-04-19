import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema({
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "lead",
        required: true,
    },
    quotationNo: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
    },
    items: [{
        service: String,
        description: String,
        quantity: Number,
        price: Number,
        amount: Number
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Draft", "Sent", "Accepted", "Rejected", "Expired"],
        default: "Draft"
    },
    notes: {
        type: String,
        default: "",
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        required: true
    }
}, { timestamps: true });

export default mongoose.model("quotation", quotationSchema);
