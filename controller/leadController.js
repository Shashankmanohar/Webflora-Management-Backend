import Lead from "../model/leadModel.js";

// Create a new lead
const createLead = async (req, res) => {
    try {
        const { leadName, contactNumber, email, address, source, notes } = req.body;
        const adminId = req.user.id;

        const newLead = new Lead({
            leadName,
            contactNumber,
            email,
            address,
            source,
            notes,
            adminId
        });

        await newLead.save();
        res.status(201).json({ success: true, message: "Lead created successfully", lead: newLead });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create lead", error: error.message });
    }
};

// Get all leads
const getAllLeads = async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, leads });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch leads", error: error.message });
    }
};

// Get lead by ID
const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }
        res.status(200).json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch lead", error: error.message });
    }
};

// Update lead
const updateLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lead) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }
        res.status(200).json({ success: true, message: "Lead updated successfully", lead });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update lead", error: error.message });
    }
};

// Delete lead
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) {
            return res.status(404).json({ success: false, message: "Lead not found" });
        }
        res.status(200).json({ success: true, message: "Lead deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete lead", error: error.message });
    }
};

export { createLead, getAllLeads, getLeadById, updateLead, deleteLead };
