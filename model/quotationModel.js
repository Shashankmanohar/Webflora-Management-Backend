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
    projectName: {
        type: String,
        default: "",
    },
    projectType: {
        type: String,
        default: "Website Development",
    },
    projectOverview: {
        type: String,
        default: "",
    },
    scopeOfWork: {
        type: String,
        default: "",
    },
    websitePages: [{
        page: { type: String, required: true },
        included: { type: Boolean, default: true }
    }],
    adminPanelFeatures: [{
        feature: { type: String, required: true },
        included: { type: Boolean, default: true }
    }],
    items: [{
        service: String,
        description: String,
        quantity: Number,
        price: Number,
        amount: Number,
        isMonthly: { type: Boolean, default: false }
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    timeline: [{
        stage: String,
        days: Number
    }],
    deliverables: [{
        type: String
    }],
    paymentTerms: [{
        type: String
    }],
    additionalServices: [{
        service: String,
        price: Number,
        isMonthly: { type: Boolean, default: false }
    }],
    termsAndConditions: [{
        type: String
    }],
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
