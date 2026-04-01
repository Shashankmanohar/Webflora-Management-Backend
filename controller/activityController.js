import Activity from "../model/activityModel.js";
import Employee from "../model/employeeModel.js";
import Intern from "../model/internModel.js";

// Log daily activity
const logActivity = async (req, res) => {
    try {
        const { date, content, projectId } = req.body;
        const { id, role } = req.user;

        if (!date || !content) {
            return res.status(400).json({ message: "Date and content are required" });
        }

        // Determine who we are logging for (Default to self)
        const finalUserId = id;
        const finalUserModel = role;

        // Get user name for better display
        let user;
        if (finalUserModel === 'employee') user = await Employee.findById(finalUserId);
        else if (finalUserModel === 'intern') user = await Intern.findById(finalUserId);

        const newActivity = new Activity({
            userId: finalUserId,
            userModel: finalUserModel,
            userName: user?.name || "Unknown",
            date,
            content,
            projectId,
            loggedAt: new Date()
        });

        await newActivity.save();
        res.status(201).json({ message: "Activity logged successfully", activity: newActivity });
    } catch (error) {
        res.status(500).json({ message: "Failed to log activity", error: error.message });
    }
};

// Get activities (Admin see all, User see own)
const getActivities = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { userId, startDate, endDate } = req.query;

        let query = {};

        if (role !== 'admin') {
            // Non-admin can only see their own activities
            query.userId = id;
        } else if (userId) {
            // Admin can filter by userId
            query.userId = userId;
        }

        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        const activities = await Activity.find(query)
            .populate("projectId", "projectName")
            .sort({ date: -1, loggedAt: -1 });

        res.status(200).json({ activities });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch activities", error: error.message });
    }
};

// Update activity
const updateActivity = async (req, res) => {
    try {
        const { id } = req.query; // Activity ID
        const { content } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        // Only owner or admin can update
        if (userRole !== 'admin' && String(activity.userId) !== String(userId)) {
            return res.status(403).json({ message: "Access denied" });
        }

        activity.content = content || activity.content;
        await activity.save();

        res.status(200).json({ message: "Activity updated successfully", activity });
    } catch (error) {
        res.status(500).json({ message: "Failed to update activity", error: error.message });
    }
};

// Delete activity
const deleteActivity = async (req, res) => {
    try {
        const { id } = req.query; // Activity ID
        const userId = req.user.id;
        const userRole = req.user.role;

        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        // Only owner can delete (Admin restriction requested)
        if (String(activity.userId) !== String(userId)) {
            return res.status(403).json({ message: "Access denied. Only the author can delete this log." });
        }

        await Activity.findByIdAndDelete(id);
        res.status(200).json({ message: "Activity deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete activity", error: error.message });
    }
};

export { logActivity, getActivities, updateActivity, deleteActivity };
