import Agreement from "../model/agreementModel.js";
import Counter from "../model/counterModel.js";
import Admin from "../model/adminModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Helper to get mail transporter
const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Create a new agreement
export const createAgreement = async (req, res) => {
  try {
    const adminId = req.user.id;
    const adminUser = await Admin.findById(adminId);
    const adminName = adminUser ? adminUser.name : "Admin";

    // Dynamic sequence ID generation (WT-AGR-YYYY-XXXX)
    const year = new Date().getFullYear();
    const counter = await Counter.findOneAndUpdate(
      { id: `agreementNumber-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const agreementId = `WT-AGR-${year}-${String(counter.seq).padStart(4, "0")}`;

    const agreementData = {
      ...req.body,
      agreementId,
      createdBy: adminId,
      auditLogs: [
        {
          action: "Agreement Created as Draft",
          timestamp: new Date(),
          adminName,
        },
      ],
    };

    const newAgreement = new Agreement(agreementData);
    await newAgreement.save();

    res.status(201).json({
      success: true,
      message: "Agreement created successfully",
      agreement: newAgreement,
    });
  } catch (error) {
    console.error("Create Agreement Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create agreement",
      error: error.message,
    });
  }
};

// Get all agreements with advanced filtering & search
export const getAllAgreements = async (req, res) => {
  try {
    const { status, search, client, limit = 100, page = 1 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (client) {
      query["clientInfo.clientName"] = new RegExp(client, "i");
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { agreementId: searchRegex },
        { "clientInfo.clientName": searchRegex },
        { "clientInfo.companyName": searchRegex },
        { "projectInfo.title": searchRegex },
      ];
    }

    const agreements = await Agreement.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      agreements,
    });
  } catch (error) {
    console.error("Get Agreements Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agreements",
      error: error.message,
    });
  }
};

// Get agreement by ID
export const getAgreementById = async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id).populate("createdBy", "name email");
    if (!agreement) {
      return res.status(404).json({ success: false, message: "Agreement not found" });
    }
    res.status(200).json({ success: true, agreement });
  } catch (error) {
    console.error("Get Agreement By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agreement details",
      error: error.message,
    });
  }
};

// Update agreement fields
export const updateAgreement = async (req, res) => {
  try {
    const adminId = req.user.id;
    const adminUser = await Admin.findById(adminId);
    const adminName = adminUser ? adminUser.name : "Admin";

    const existingAgreement = await Agreement.findById(req.params.id);
    if (!existingAgreement) {
      return res.status(404).json({ success: false, message: "Agreement not found" });
    }

    // Detect status change to add specific audit log
    const statusChanged = req.body.status && req.body.status !== existingAgreement.status;
    const auditLogs = [...existingAgreement.auditLogs];

    if (statusChanged) {
      auditLogs.push({
        action: `Status updated from ${existingAgreement.status} to ${req.body.status}`,
        timestamp: new Date(),
        adminName,
      });
    } else {
      auditLogs.push({
        action: "Agreement details modified",
        timestamp: new Date(),
        adminName,
      });
    }

    const updatedData = {
      ...req.body,
      auditLogs,
    };

    const updatedAgreement = await Agreement.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    }).populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Agreement updated successfully",
      agreement: updatedAgreement,
    });
  } catch (error) {
    console.error("Update Agreement Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update agreement",
      error: error.message,
    });
  }
};

// Delete agreement
export const deleteAgreement = async (req, res) => {
  try {
    const agreement = await Agreement.findByIdAndDelete(req.params.id);
    if (!agreement) {
      return res.status(404).json({ success: false, message: "Agreement not found" });
    }
    res.status(200).json({ success: true, message: "Agreement deleted successfully" });
  } catch (error) {
    console.error("Delete Agreement Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete agreement",
      error: error.message,
    });
  }
};

// Duplicate an existing agreement as a new draft template
export const duplicateAgreement = async (req, res) => {
  try {
    const adminId = req.user.id;
    const adminUser = await Admin.findById(adminId);
    const adminName = adminUser ? adminUser.name : "Admin";

    const originalAgreement = await Agreement.findById(req.params.id);
    if (!originalAgreement) {
      return res.status(404).json({ success: false, message: "Original agreement not found" });
    }

    // Dynamic sequence ID generation (WT-AGR-YYYY-XXXX)
    const year = new Date().getFullYear();
    const counter = await Counter.findOneAndUpdate(
      { id: `agreementNumber-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const newAgreementId = `WT-AGR-${year}-${String(counter.seq).padStart(4, "0")}`;

    const originalObj = originalAgreement.toObject();
    
    // Remove database internal fields
    delete originalObj._id;
    delete originalObj.createdAt;
    delete originalObj.updatedAt;
    delete originalObj.__v;

    const duplicatedData = {
      ...originalObj,
      agreementId: newAgreementId,
      status: "Draft",
      digitalSignature: {
        signatureData: "",
        signedBy: "",
        signedAt: null,
        signStatus: "Pending",
      },
      pdfFilePath: "",
      createdBy: adminId,
      auditLogs: [
        {
          action: `Agreement duplicated from ${originalAgreement.agreementId} as new Draft`,
          timestamp: new Date(),
          adminName,
        },
      ],
    };

    const newAgreement = new Agreement(duplicatedData);
    await newAgreement.save();

    res.status(201).json({
      success: true,
      message: `Agreement duplicated as new draft ${newAgreementId}`,
      agreement: newAgreement,
    });
  } catch (error) {
    console.error("Duplicate Agreement Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to duplicate agreement",
      error: error.message,
    });
  }
};

// Send professional contract email notification to client
export const sendAgreementEmail = async (req, res) => {
  try {
    const adminId = req.user.id;
    const adminUser = await Admin.findById(adminId);
    const adminName = adminUser ? adminUser.name : "Admin";

    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) {
      return res.status(404).json({ success: false, message: "Agreement not found" });
    }

    const transporter = getTransporter();
    if (!transporter) {
      return res.status(400).json({
        success: false,
        message: "SMTP Mailer credentials missing from environment setup (.env)",
      });
    }

    const frontendUrl = "https://webflora-management-frontend.vercel.app";
    const mailOptions = {
      from: `"Webflora Legal & Agreements" <${process.env.EMAIL_USER}>`,
      to: agreement.clientInfo.email,
      subject: `Action Required: IT Service Agreement - ${agreement.projectInfo.title} (${agreement.agreementId})`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #ff5f1f; color: white; padding: 35px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800;">IT Service Agreement</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Document Ref: ${agreement.agreementId}</p>
          </div>
          <div style="padding: 40px;">
            <p style="font-size: 16px;">Dear <strong>${agreement.clientInfo.clientName}</strong>,</p>
            <p>We are excited to partner with you on the project <strong>"${agreement.projectInfo.title}"</strong>. To proceed formally, we have generated the IT Service Agreement for your review and digital signature.</p>
            
            <div style="background-color: #fcf6f2; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #ffedd5;">
              <p style="margin: 0 0 12px 0; font-weight: 800; color: #ff5f1f; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Agreement Highlights</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Company:</strong> ${agreement.companyInfo.companyName}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Client:</strong> ${agreement.clientInfo.companyName || agreement.clientInfo.clientName}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Project Type:</strong> ${agreement.projectInfo.projectType}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Contract Value:</strong> INR ${agreement.payment.totalCost.toLocaleString("en-IN")}</p>
            </div>

            <p style="font-size: 15px;">Please review the complete legal contract, payment schedules, and deliverables. You can view and sign the document online using the secure link below:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${frontendUrl}/agreements" style="background-color: #ff5f1f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 8px 12px rgba(255, 95, 31, 0.2);">Review & E-Sign Contract</a>
            </div>

            <p style="font-size: 13px; color: #6b7280; text-align: center;">This link will direct you to the secure Webflora Portal for authentication and digital signing.</p>
          </div>
          <div style="background-color: #f9fafb; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid #f1f5f9;">
            &copy; ${new Date().getFullYear()} Webflora Technologies &bull; Secure Digital Signature Portal.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    agreement.status = "Sent";
    agreement.auditLogs.push({
      action: "Agreement sent to client by email",
      timestamp: new Date(),
      adminName,
    });
    await agreement.save();

    res.status(200).json({
      success: true,
      message: "Agreement email sent to client successfully",
      agreement,
    });
  } catch (error) {
    console.error("Send Agreement Email Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send agreement email",
      error: error.message,
    });
  }
};

// Apply client digital/handdrawn e-signature
export const eSignAgreement = async (req, res) => {
  try {
    const adminId = req.user.id;
    const adminUser = await Admin.findById(adminId);
    const adminName = adminUser ? adminUser.name : "Admin";

    const { signatureData, signedBy } = req.body;
    if (!signatureData || !signedBy) {
      return res.status(400).json({
        success: false,
        message: "Signature image data and signee name are required",
      });
    }

    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) {
      return res.status(404).json({ success: false, message: "Agreement not found" });
    }

    agreement.digitalSignature = {
      signatureData,
      signedBy,
      signedAt: new Date(),
      signStatus: "Signed",
    };
    agreement.status = "Signed";

    agreement.auditLogs.push({
      action: `Agreement E-Signed by ${signedBy}`,
      timestamp: new Date(),
      adminName,
    });

    await agreement.save();

    res.status(200).json({
      success: true,
      message: "Agreement e-signed successfully!",
      agreement,
    });
  } catch (error) {
    console.error("E-Sign Agreement Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register digital signature",
      error: error.message,
    });
  }
};
