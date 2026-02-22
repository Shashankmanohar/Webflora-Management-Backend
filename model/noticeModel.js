import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    audienceType: {
        type: String,
        enum: ['all', 'employee', 'intern', 'individual'],
        default: 'all',
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'targetModel',
    },
    targetModel: {
        type: String,
        enum: ['employee', 'intern'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Notice = mongoose.model("notice", noticeSchema);

export default Notice;