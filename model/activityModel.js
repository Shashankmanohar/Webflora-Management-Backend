import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        required: true,
        enum: ['employee', 'intern']
    },
    userName: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: true // Format YYYY-MM-DD for easy calendar matching
    },
    content: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        required: false
    },
    loggedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Activity = mongoose.model("activity", activitySchema);

export default Activity;
