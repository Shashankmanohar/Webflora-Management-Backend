import Intern from "../model/internModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Salary from "../model/salaryModel.js";

// -----------------------------------------------
// Admin - Add Intern
// -----------------------------------------------
const Addintern = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      duration,
      salary,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !duration ||
      !salary
    ) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Prevent duplicate email
    const existingIntern = await Intern.findOne({ email });
    if (existingIntern) {
      return res.status(400).json({ message: "Intern already exists!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new intern
    const newIntern = new Intern({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      duration,
      salary,
      role: "intern"
    });

    await newIntern.save();

    return res.status(201).json({
      message: "Intern created successfully",
      intern: {
        id: newIntern._id,
        name: newIntern.name,
        email: newIntern.email,
        role: newIntern.role,
        phone: newIntern.phone,
        duration: newIntern.duration,
        salary: newIntern.salary,
        createdAt: newIntern.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// -----------------------------------------------
// Intern Login
// -----------------------------------------------
const LoginIntern = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("All fields are required!");
    }

    // Find intern by email
    const intern = await Intern.findOne({ email });

    if (!intern) {
      return res.status(404).json("Intern not found!");
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      intern.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json("Invalid password");
    }

    // Generate token
    const token = jwt.sign(
      {
        id: intern._id,
        role: intern.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      intern: {
        id: intern._id,
        name: intern.name,
        email: intern.email,
        role: intern.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to login", error: error.message });
  }
};

// Get All Interns
// -----------------------------------------------
const getAllIntern = async (req, res) => {
  try {
    const interns = await Intern.aggregate([
      {
        $lookup: {
          from: "salaries",
          localField: "_id",
          foreignField: "payeeId",
          as: "payments"
        }
      },
      {
        $addFields: {
          totalPaid: { $sum: "$payments.amount" }
        }
      },
      {
        $project: {
          password: 0,
          payments: 0
        }
      }
    ]);
    res.status(200).json({ interns });
  } catch (error) {
    res.status(500).json({ message: "Failed to get interns", error: error.message });
    console.error(error);
  }
};

// -----------------------------------------------
// Update Intern
// -----------------------------------------------
const updateIntern = async (req, res) => {
  try {
    const { id } = req.params;

    let {
      name,
      email,
      password,
      phone,
      address,
      duration,
      salary,
    } = req.body;

    // Find intern by ID
    const intern = await Intern.findById(id);
    if (!intern) {
      return res.status(404).json("Intern not found!");
    }

    // If password provided → hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      intern.password = await bcrypt.hash(password, salt);
    }

    // Update only provided fields
    intern.name = name || intern.name;
    intern.email = email || intern.email;
    intern.phone = phone || intern.phone;
    intern.address = address || intern.address;
    intern.duration = duration || intern.duration;
    intern.salary = salary || intern.salary;

    await intern.save();

    res.status(200).json({
      message: "Intern updated successfully",
      intern: {
        id: intern._id,
        name: intern.name,
        email: intern.email,
        role: intern.role,
        phone: intern.phone,
        updatedAt: intern.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update intern", error: error.message });
  }
};

// -----------------------------------------------
// Delete Intern
// -----------------------------------------------
const deleteIntern = async (req, res) => {
  try {
    const { id } = req.params;
    const internID = await Intern.findByIdAndDelete(id);
    if (!internID) {
      return res.status(401).json({ message: "Intern not found!" });
    }
    res.status(201).json({ message: "Interns deleted successfully!" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete intern", error: error.message });
    console.error(error);
  }
}

// Get Intern by ID
const getInternById = async (req, res) => {
  try {
    const { id } = req.params;
    const internData = await Intern.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      {
        $lookup: {
          from: "salaries",
          localField: "_id",
          foreignField: "payeeId",
          as: "payments"
        }
      },
      {
        $addFields: {
          totalPaid: { $sum: "$payments.amount" }
        }
      },
      {
        $project: {
          password: 0,
          payments: 0
        }
      }
    ]);

    if (!internData || internData.length === 0) {
      return res.status(404).json("Intern not found!");
    }
    res.status(200).json({ intern: internData[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get intern", error: error.message });
  }
};

export { Addintern, LoginIntern, getAllIntern, getInternById, updateIntern, deleteIntern };
