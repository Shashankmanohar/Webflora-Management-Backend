import invoiceModel from "../model/invoiceModel.js";
import projectModel from "../model/projectModel.js";
import Counter from "../model/counterModel.js";


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
            status,
            items
        } = req.body;

        if (!clientId || !projectId || !referenceNo || !amount || !method) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        let invNo = invoiceNo;
        if (!invNo) {
            const year = new Date().getFullYear();
            const counter = await Counter.findOneAndUpdate(
                { id: `invoiceNumber-${year}` },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            invNo = `WT-INV-${year}-${String(counter.seq).padStart(4, '0')}`;
        }

        const existingInvoice = await invoiceModel.findOne({ invoiceNo: invNo });
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

        // Calculate previous due for the client across other projects
        // Previous due = Sum of all (Project Total - Invoiced Amount) for other projects
        const otherClientProjects = await projectModel.find({ client: clientId, _id: { $ne: projectId } });
        let totalClientDue = 0;
        let dueBreakdown = [];
        for (const p of otherClientProjects) {
            const projectInvoices = await invoiceModel.find({ projectId: p._id });
            const totalInvoiced = projectInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
            const remaining = Math.max(0, p.totalAmount - totalInvoiced);
            if (remaining > 0) {
                totalClientDue += remaining;
                dueBreakdown.push({
                    projectName: p.projectName,
                    amount: remaining
                });
            }
        }

        const newInvoice = new invoiceModel({
            clientId,
            projectId,
            referenceNo,
            invoiceNo: invNo,
            amount: Number(amount),
            description,
            method,
            items: items || [],
            date,
            status,
            previousDue: totalClientDue,
            dueBreakdown: dueBreakdown
        });

        await newInvoice.save();

        // Populate and calculate financials for the response
        const populatedInvoice = await invoiceModel.findById(newInvoice._id)
            .populate("clientId")
            .populate("projectId");

        if (populatedInvoice.projectId && typeof populatedInvoice.projectId === 'object') {
            const projectInvoices = await invoiceModel.find({ projectId: populatedInvoice.projectId._id });
            const totalPaidProject = projectInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
            populatedInvoice.projectId = {
                ...populatedInvoice.projectId.toObject(),
                totalPaid: totalPaidProject,
                dueAmount: populatedInvoice.projectId.totalAmount - totalPaidProject
            };
        }

        res.status(201).json({
            message: "Invoice created successfully",
            invoice: {
                ...populatedInvoice.toObject(),
                id: populatedInvoice._id,
                number: populatedInvoice.invoiceNo,
                total: populatedInvoice.amount,
                grandTotal: populatedInvoice.amount + (populatedInvoice.previousDue || 0)
            }
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

        const invoicesWithTotals = await Promise.all(invoices.map(async (inv) => {
            return {
                ...inv.toObject(),
                clientName: inv.clientId?.clientName || "Unknown",
                projectName: inv.projectId?.projectName || "Unknown",
                id: inv._id,
                number: inv.invoiceNo,
                total: inv.amount,
                grandTotal: inv.amount + (inv.previousDue || 0)
            };
        }));

        res.status(200).json({ invoices: invoicesWithTotals });
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

        const invoicesWithTotals = await Promise.all(invoices.map(async (inv) => {
            return {
                ...inv.toObject(),
                clientName: inv.clientId?.clientName || "Unknown",
                projectName: inv.projectId?.projectName || "Unknown",
                id: inv._id,
                number: inv.invoiceNo,
                total: inv.amount,
                grandTotal: inv.amount + (inv.previousDue || 0)
            };
        }));

        res.status(200).json({ invoices: invoicesWithTotals });

    } catch (error) {
        res.status(500).json({ message: "Failed to get invoices", error: error.message });
    }
};


// Get all invoices
const getAllInvoice = async (req, res) => {
    try {
        const invoices = await invoiceModel
            .find()
            .populate("clientId")
            .populate("projectId");

        const invoicesWithTotals = await Promise.all(invoices.map(async (inv) => {
            return {
                ...inv.toObject(),
                clientName: inv.clientId?.clientName || "Unknown",
                projectName: inv.projectId?.projectName || "Unknown",
                id: inv._id,
                number: inv.invoiceNo,
                total: inv.amount,
                grandTotal: inv.amount + (inv.previousDue || 0)
            };
        }));

        res.status(200).json({ invoice: invoicesWithTotals });

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
            status,
            items
        } = req.body;

        // Check for duplicate invoice number if it's being changed
        if (invoiceNo && invoiceNo !== invoice.invoiceNo) {
            const existingWithNewNo = await invoiceModel.findOne({ invoiceNo, _id: { $ne: id } });
            if (existingWithNewNo) {
                return res.status(409).json({ message: "Invoice number already exists!" });
            }
        }

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
        invoice.description = description !== undefined ? description : invoice.description;
        invoice.method = method || invoice.method;
        invoice.items = items !== undefined ? items : invoice.items;
        invoice.date = date || invoice.date;
        invoice.status = status || invoice.status;

        await invoice.save();

        // Populate and calculate financials for the response
        const populatedInvoice = await invoiceModel.findById(invoice._id)
            .populate("clientId")
            .populate("projectId");

        if (populatedInvoice.projectId && typeof populatedInvoice.projectId === 'object') {
            const projectInvoices = await invoiceModel.find({ projectId: populatedInvoice.projectId._id });
            const totalPaidProject = projectInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
            populatedInvoice.projectId = {
                ...populatedInvoice.projectId.toObject(),
                totalPaid: totalPaidProject,
                dueAmount: populatedInvoice.projectId.totalAmount - totalPaidProject
            };
        }

        res.status(200).json({
            message: "Invoice updated successfully",
            invoice: {
                ...populatedInvoice.toObject(),
                id: populatedInvoice._id,
                number: populatedInvoice.invoiceNo,
                total: populatedInvoice.amount,
                grandTotal: populatedInvoice.amount + (populatedInvoice.previousDue || 0)
            }
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

        // For delete, return the updated project balance too
        const project = await projectModel.findById(invoice.projectId);
        let projectSummary = null;
        if (project) {
            const projectInvoices = await invoiceModel.find({ projectId: project._id });
            const totalPaid = projectInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
            projectSummary = {
                ...project.toObject(),
                totalPaid,
                dueAmount: project.totalAmount - totalPaid
            };
        }

        // Calculate totalDue for the client (Sum of all projects' remaining budget)
        let clientTotalDue = 0;
        if (invoice.clientId) {
            const allClientProjects = await projectModel.find({ client: invoice.clientId });
            for (const p of allClientProjects) {
                const projectInvoices = await invoiceModel.find({ projectId: p._id });
                const totalInvoiced = projectInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
                clientTotalDue += (Math.max(0, p.totalAmount - totalInvoiced));
            }
        }

        res.status(200).json({
            message: "Invoice deleted successfully",
            invoice,
            project: projectSummary
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
