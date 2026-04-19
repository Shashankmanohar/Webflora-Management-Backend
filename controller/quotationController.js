import Quotation from "../model/quotationModel.js";
import Lead from "../model/leadModel.js";
import Counter from "../model/counterModel.js";

// Create a new quotation
const createQuotation = async (req, res) => {
    try {
        const { leadId, date, validUntil, items, totalAmount, notes, status, quotationNo } = req.body;
        const adminId = req.user.id;

        if (!leadId || !totalAmount) {
            return res.status(400).json({ success: false, message: "Lead ID and total amount are required" });
        }

        let qNo = quotationNo;
        if (!qNo) {
            const year = new Date().getFullYear();
            const counter = await Counter.findOneAndUpdate(
                { id: `quotationNumber-${year}` },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            qNo = `WT-QTN-${year}-${String(counter.seq).padStart(4, '0')}`;
        }

        const existingQuotation = await Quotation.findOne({ quotationNo: qNo });
        if (existingQuotation) {
            return res.status(409).json({ success: false, message: "Quotation number already exists" });
        }

        const newQuotation = new Quotation({
            leadId,
            quotationNo: qNo,
            date,
            validUntil,
            items: items || [],
            totalAmount,
            notes,
            status: status || "Draft",
            adminId
        });

        await newQuotation.save();
        res.status(201).json({ success: true, message: "Quotation created successfully", quotation: newQuotation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create quotation", error: error.message });
    }
};

// Get all quotations
const getAllQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find()
            .populate("leadId", "leadName email contactNumber")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, quotations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch quotations", error: error.message });
    }
};

// Get quotation by ID
const getQuotationById = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id).populate("leadId");
        if (!quotation) {
            return res.status(404).json({ success: false, message: "Quotation not found" });
        }
        res.status(200).json({ success: true, quotation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch quotation", error: error.message });
    }
};

// Update quotation
const updateQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!quotation) {
            return res.status(404).json({ success: false, message: "Quotation not found" });
        }
        res.status(200).json({ success: true, message: "Quotation updated successfully", quotation });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update quotation", error: error.message });
    }
};

// Delete quotation
const deleteQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndDelete(req.params.id);
        if (!quotation) {
            return res.status(404).json({ success: false, message: "Quotation not found" });
        }
        res.status(200).json({ success: true, message: "Quotation deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete quotation", error: error.message });
    }
};

export { createQuotation, getAllQuotations, getQuotationById, updateQuotation, deleteQuotation };
