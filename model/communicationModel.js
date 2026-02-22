import mongoose from "mongoose";

const communicationSchema = new mongoose.Schema({
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
    communicationTitle: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "resolved", "inProgress"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userPhone: {
        type: String,
        required: true
    },
    adminReply: {
        type: String,
        default: "No reply yet"
    },
    adminReplyAt: {
        type: Date,
        default: Date.now
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        required: false
    },
    adminName: {
        type: String,
        required: false
    },

})

const Communication = mongoose.model("communication", communicationSchema);

export default Communication;