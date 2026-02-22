import mongoose from 'mongoose';

const handoverSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "project",
        required: true
    },
    assigneeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'assigneeModel'
    },
    assigneeModel: {
        type: String,
        required: true,
        enum: ['employee', 'intern']
    },
    handoverDate: {
        type: Date,
        default: Date.now
    },
    deadline: Date,
    credentials: {
        adminUrl: String,
        adminUser: String,
        adminPass: String,
        dbUrl: String,
        serverIp: String,
        ftpHost: String,
        ftpUser: String,
        ftpPass: String,
        githubUrl: String,
    },
    instructions: String,
    status: {
        type: String,
        enum: ["In Progress", "Handed Over", "Completed", "Revoked"],
        default: "In Progress"
    }
}, { timestamps: true });

export default mongoose.model("handover", handoverSchema);
