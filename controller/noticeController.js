import Notice from "../model/noticeModel.js";

// Admin can create a notice
const createNotice = async (req, res) => {
    try {
        const { title, content, audienceType, targetId, targetModel } = req.body;
        const adminId = req.user.id;
        const notice = await Notice.create({
            title,
            content,
            adminId,
            audienceType: audienceType || 'all',
            targetId,
            targetModel
        });
        res.status(201).json({ message: "Notice created successfully", notice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Employee can view one notice
const getOneNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }
        res.status(200).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get notices based on user role and ID
const getNotices = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};

        if (userRole !== 'admin') {
            // For non-admins, filter by audience
            query = {
                $or: [
                    { audienceType: 'all' },
                    { audienceType: userRole }, // 'employee' or 'intern'
                    { audienceType: 'individual', targetId: userId }
                ]
            };
        }

        const notices = await Notice.find(query).sort({ createdAt: -1 });
        res.status(200).json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin can delete a notice
const deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await Notice.findByIdAndDelete(id);
        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }
        res.status(200).json({ message: "Notice deleted successfully", notice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createNotice, getOneNotice, getNotices, deleteNotice };
