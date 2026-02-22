import invoiceModel from "../model/invoiceModel.js";
import projectModel from "../model/projectModel.js";

// Add Invoice
const AddInvoice = async (req, res) => {
    try {
        const {
            clientId,
            projectId,
            referenceNo,
            invoiceNo,
            amount,
            description,
            method,
            date,
            status
        } = req.body;

        if (!clientId || !projectId || !referenceNo || !invoiceNo || !amount || !method) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        const existingInvoice = await invoiceModel.findOne({ invoiceNo });
        if (existingInvoice) {
            return res.status(409).json({ message: "Invoice already exists!" });
        }

        // Validate amount against project budget
        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const existingInvoices = await invoiceModel.find({ projectId });
        const totalPaid = existingInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

        if (totalPaid + Number(amount) > project.totalAmount) {
            const remaining = project.totalAmount - totalPaid;
            return res.status(400).json({
                message: `Invoice amount exceeds project budget. Remaining budget: ₹${remaining}`
            });
        }

        const newInvoice = new invoiceModel({
            clientId,
            projectId,
            referenceNo,
            invoiceNo,
            amount: Number(amount),
            description,
            method,
            date,
            status
        });

        await newInvoice.save();

        res.status(201).json({
            message: "Invoice created successfully",
            invoice: newInvoice
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to create invoice", error: error.message });
    }
};


// Get invoices by project ID
const getInvoicesByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const invoices = await invoiceModel
            .find({ projectId })
            .populate("clientId")
            .populate("projectId");

        res.status(200).json({ invoices });
    } catch (error) {
        res.status(500).json({ message: "Failed to get invoices", error: error.message });
    }
};

// Get invoice by reference number
const getInvoice = async (req, res) => {
    try {
        const { referenceNo } = req.params;

        const invoices = await invoiceModel
            .find({ referenceNo })
            .populate("clientId")
            .populate("projectId");

        if (!invoices || invoices.length === 0) {
            return res.status(404).json({ message: "No invoices found!" });
        }

        res.status(200).json({ invoices });

    } catch (error) {
        res.status(500).json({ message: "Failed to get invoices", error: error.message });
    }
};


// Get all invoices
const getAllInvoice = async (req, res) => {
    try {
        const invoice = await invoiceModel
            .find()
            .populate("clientId")
            .populate("projectId");

        res.status(200).json({ invoice });

    } catch (error) {
        res.status(500).json({ message: "Failed to get invoices", error: error.message });
    }
};


// Update invoice
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await invoiceModel.findById(id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found!" });
        }

        const {
            clientId,
            projectId: newProjectId,
            referenceNo,
            invoiceNo,
            amount: newAmount,
            description,
            method,
            date,
            status
        } = req.body;

        // Validate amount if updated
        const targetProjectId = newProjectId || invoice.projectId;
        const targetAmount = newAmount !== undefined ? Number(newAmount) : Number(invoice.amount);

        if (newAmount !== undefined || newProjectId !== undefined) {
            const project = await projectModel.findById(targetProjectId);
            if (!project) {
                return res.status(404).json({ message: "Project not found" });
            }

            const existingInvoices = await invoiceModel.find({ projectId: targetProjectId, _id: { $ne: id } });
            const totalPaid = existingInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

            if (totalPaid + targetAmount > project.totalAmount) {
                const remaining = project.totalAmount - totalPaid;
                return res.status(400).json({
                    message: `Update failed. Amount exceeds project budget. Remaining budget: ₹${remaining}`
                });
            }
        }

        invoice.clientId = clientId || invoice.clientId;
        invoice.projectId = newProjectId || invoice.projectId;
        invoice.referenceNo = referenceNo || invoice.referenceNo;
        invoice.invoiceNo = invoiceNo || invoice.invoiceNo;
        invoice.amount = newAmount !== undefined ? Number(newAmount) : invoice.amount;
        invoice.description = description || invoice.description;
        invoice.method = method || invoice.method;
        invoice.date = date || invoice.date;
        invoice.status = status || invoice.status;

        await invoice.save();

        res.status(200).json({
            message: "Invoice updated successfully",
            invoice
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to update invoice", error: error.message });
    }
};


// Delete Invoice
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await invoiceModel.findByIdAndDelete(id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found!" });
        }

        res.status(200).json({
            message: "Invoice deleted successfully",
            invoice
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to delete invoice", error: error.message });
    }
};


export {
    AddInvoice,
    getInvoice,
    getAllInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicesByProject
};
