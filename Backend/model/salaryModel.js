import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    payeeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'payeeModel'
    },
    payeeModel: {
        type: String,
        required: true,
        enum: ['employee', 'intern']
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    remarks: {
        type: String
    }
}, { timestamps: true });

const Salary = mongoose.model("salary", salarySchema);

export default Salary;
