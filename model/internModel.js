import mongoose from "mongoose";

const internSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      minlength: [10, "Phone number must be at least 10 digits."],
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "intern",
      enum: ["intern"],
    },
    salary: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("intern", internSchema);
