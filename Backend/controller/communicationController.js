import Communication from "../model/communicationModel.js";
import Employee from "../model/employeeModel.js";
import Intern from "../model/internModel.js";
import Admin from "../model/adminModel.js";

// Create communication
const createCommunication = async (req, res) => {
    try {
        const { communicationTitle, content, title, description } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const finalTitle = communicationTitle || title;
        const finalContent = content || description;

        if (!finalTitle || !finalContent) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        let user;
        if (userRole === 'employee') {
            user = await Employee.findById(userId);
        } else if (userRole === 'intern') {
            user = await Intern.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const communication = new Communication({
            userId,
            userModel: userRole,
            communicationTitle: finalTitle,
            content: finalContent,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phone || 'N/A'
        });

        await communication.save();
        res.status(201).json({ message: "Communication created successfully", communication });
    } catch (error) {
        console.error("Communication Creation Error:", error);
        res.status(500).json({ message: "Failed to create communication", error: error.message });
    }
};

// Unified list endpoint
const getCommunications = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;

        let query = {};
        if (userRole !== 'admin') {
            query = { userId };
        }

        const communications = await Communication.find(query).sort({ createdAt: -1 });
        // The model already contains userName, userEmail, userPhone
        res.status(200).json({ communications });
    } catch (error) {
        res.status(500).json({ message: "Failed to get communications", error: error.message });
    }
};

// User gets a single record by ID
const getCommunicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        const userId = req.user.id;

        let query = { _id: id };
        if (userRole !== 'admin') {
            query.userId = userId;
        }

        const communication = await Communication.findOne(query);
        if (!communication) return res.status(404).json({ message: "Communication not found" });
        return res.status(200).json({ communication });
    } catch (error) {
        res.status(500).json({ message: "Failed to get communication", error: error.message });
    }
};

// Admin replies
const replyToCommunication = async (req, res) => {
    try {
        const { reply, status } = req.body;
        const { id } = req.params;
        const adminId = req.user.id;

        const admin = await Admin.findById(adminId);
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const communication = await Communication.findById(id);
        if (!communication) return res.status(404).json({ message: "Communication not found" });

        communication.adminReply = reply;
        communication.status = status;
        communication.adminReplyAt = new Date();
        communication.adminId = adminId;
        communication.adminName = admin.name;

        await communication.save();
        res.status(200).json({ message: "Communication replied successfully", communication });
    } catch (error) {
        res.status(500).json({ message: "Failed to reply", error: error.message });
    }
};

const deleteCommunication = async (req, res) => {
    try {
        const { id } = req.params;
        const communication = await Communication.findByIdAndDelete(id);
        if (!communication) return res.status(404).json({ message: "Communication not found" });
        res.status(200).json({ message: "Communication deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete", error: error.message });
    }
};

export { createCommunication, getCommunications, getCommunicationById, replyToCommunication, deleteCommunication };
