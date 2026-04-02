import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, "Date is required"],
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: ["Food", "Travel", "Office Supplies", "Salary/Payment", "Marketing", "Others"],
    },
    type: {
        type: String,
        required: [true, "Expense type is required"],
        enum: ["Self Spent", "Sent to Employee", "Sent to Intern", "Company Expense"],
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'recipientModel',
    },
    recipientModel: {
        type: String,
        enum: ["employee", "intern"],
    },
    receiptImage: {
        type: String,
        required: [true, "Receipt photo is compulsory"],
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Recorded by is required"],
        refPath: 'recordedByModel',
    },
    recordedByModel: {
        type: String,
        required: [true, "Recorded by model is required"],
        enum: ["admin", "employee", "intern"],
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "approved",
    }
}, { timestamps: true });

const Expense = mongoose.model("expense", expenseSchema);

export default Expense;
