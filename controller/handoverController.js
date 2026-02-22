import Handover from "../model/handoverModel.js";

// Create Handover
export const createHandover = async (req, res) => {
    try {
        const { projectId, assigneeId, assigneeModel, handoverDate, deadline, credentials, instructions, status } = req.body;

        // Validation
        if (!projectId || !assigneeId || !assigneeModel) {
            return res.status(400).json({ message: "Project ID, Assignee ID, and Assignee Model are required" });
        }

        const newHandover = new Handover({
            projectId,
            assigneeId,
            assigneeModel,
            handoverDate: handoverDate || undefined,
            deadline: deadline || null,
            credentials: credentials || {},
            instructions: instructions || '',
            status: status || 'In Progress'
        });

        await newHandover.save();
        res.status(201).json({ message: "Handover created successfully", handover: newHandover });
    } catch (error) {
        console.error("Error creating handover:", error);
        res.status(500).json({ message: "Error creating handover", error: error.message });
    }
};

// Get All Handovers (Filtered for non-admins)
export const getAllHandovers = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { assigneeId: req.user.id };
        const handovers = await Handover.find(query)
            .populate("projectId", "projectName")
            .populate("assigneeId", "name email");

        res.status(200).json(handovers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching handovers", error: error.message });
    }
};

// Get Handover by ID (Restricted for non-admins)
export const getHandoverById = async (req, res) => {
    try {
        const handover = await Handover.findById(req.params.id)
            .populate("projectId", "projectName")
            .populate("assigneeId", "name email");

        if (!handover) {
            return res.status(404).json({ message: "Handover not found" });
        }

        // Authorization check
        if (req.user.role !== 'admin' && handover.assigneeId.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to view this handover" });
        }

        res.status(200).json(handover);
    } catch (error) {
        res.status(500).json({ message: "Error fetching handover", error: error.message });
    }
};

// Update Handover
export const updateHandover = async (req, res) => {
    try {
        const updatedHandover = await Handover.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedHandover) {
            return res.status(404).json({ message: "Handover not found" });
        }
        res.status(200).json({ message: "Handover updated successfully", handover: updatedHandover });
    } catch (error) {
        res.status(500).json({ message: "Error updating handover", error: error.message });
    }
};

// Delete Handover
export const deleteHandover = async (req, res) => {
    try {
        const deletedHandover = await Handover.findByIdAndDelete(req.params.id);
        if (!deletedHandover) {
            return res.status(404).json({ message: "Handover not found" });
        }
        res.status(200).json({ message: "Handover deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting handover", error: error.message });
    }
};
