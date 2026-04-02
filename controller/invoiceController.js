import invoiceModel from "../model/invoiceModel.js";
import projectModel from "../model/projectModel.js";
import Counter from "../model/counterModel.js";


// Add Invoice
const AddInvoice = async (req, res) => {
    try {
        const {
            clientId,
            projectIds, // Array of IDs
            selectedDues, // Array of IDs
            referenceNo,
            invoiceNo,
            amount,
            description,
            method,
            date,
            status,
            items
        } = req.body;

        if (!clientId || !projectIds || !Array.isArray(projectIds) || projectIds.length === 0 || !referenceNo || !amount || !method) {
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

        // Validate amount against combined project budgets
        const projects = await projectModel.find({ _id: { $in: projectIds } });
        if (projects.length === 0) {
            return res.status(404).json({ message: "No valid projects found" });
        }

        let totalBudget = projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const existingInvoices = await invoiceModel.find({ projectIds: { $in: projectIds } });
        
        // This is complex because one invoice can span multiple projects. 
        // For simplicity, we check if total amount of this invoice + past invoices on ANY of these projects 
        // exceeds the total budget of all these projects combined.
        const totalPaid = existingInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

        if (totalPaid + Number(amount) > totalBudget) {
            const remaining = totalBudget - totalPaid;
            return res.status(400).json({
                message: `Invoice amount exceeds the combined project budget. Remaining budget: ₹${remaining}`
            });
        }

        // Calculate previous due for the client
        // If selectedDues is provided, use only those projects
        // Otherwise, use all other projects of the client
        let dueQuery = { client: clientId };
        if (selectedDues && Array.isArray(selectedDues) && selectedDues.length > 0) {
            dueQuery._id = { $in: selectedDues };
        } else {
            dueQuery._id = { $nin: projectIds };
        }

        const dueProjects = await projectModel.find(dueQuery);
        let totalClientDue = 0;
        let dueBreakdown = [];
        
        for (const p of dueProjects) {
            const projectInvoices = await invoiceModel.find({ projectIds: p._id });
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
            projectIds,
            selectedDues: selectedDues || [],
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
            .populate("projectIds");

        const projectNames = populatedInvoice.projectIds.map(p => p.projectName).join(" & ");

        res.status(201).json({
            message: "Invoice created successfully",
            invoice: {
                ...populatedInvoice.toObject(),
                id: populatedInvoice._id,
                number: populatedInvoice.invoiceNo,
                projectName: projectNames,
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
            .find({ projectIds: projectId })
            .populate("clientId")
            .populate("projectIds");

        const invoicesWithTotals = await Promise.all(invoices.map(async (inv) => {
            return {
                ...inv.toObject(),
                clientName: inv.clientId?.clientName || "Unknown",
                projectName: inv.projectIds?.map(p => p.projectName).join(" & ") || "Unknown",
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
            .populate("projectIds");

        if (!invoices || invoices.length === 0) {
            return res.status(404).json({ message: "No invoices found!" });
        }

        const invoicesWithTotals = await Promise.all(invoices.map(async (inv) => {
            return {
                ...inv.toObject(),
                clientName: inv.clientId?.clientName || "Unknown",
                projectName: inv.projectIds?.map(p => p.projectName).join(" & ") || "Unknown",
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
            .populate("projectIds");

        const invoicesWithTotals = await Promise.all(invoices.map(async (inv) => {
            return {
                ...inv.toObject(),
                clientName: inv.clientId?.clientName || "Unknown",
                projectName: (inv.projectIds?.map(p => p.projectName).join(" & ")) || "Unknown",
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
            projectIds: newProjectIds,
            selectedDues,
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
        const targetProjectIds = newProjectIds || invoice.projectIds;
        const targetAmount = newAmount !== undefined ? Number(newAmount) : Number(invoice.amount);

        if (newAmount !== undefined || newProjectIds !== undefined) {
            const projects = await projectModel.find({ _id: { $in: targetProjectIds } });
            if (projects.length === 0) {
                return res.status(404).json({ message: "Projects not found" });
            }

            let totalBudget = projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
            const existingInvoices = await invoiceModel.find({ projectIds: { $in: targetProjectIds }, _id: { $ne: id } });
            const totalPaid = existingInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

            if (totalPaid + targetAmount > totalBudget) {
                const remaining = totalBudget - totalPaid;
                return res.status(400).json({
                    message: `Update failed. Amount exceeds combined project budget. Remaining budget: ₹${remaining}`
                });
            }
        }

        invoice.clientId = clientId || invoice.clientId;
        invoice.projectIds = newProjectIds || invoice.projectIds;
        invoice.selectedDues = selectedDues !== undefined ? selectedDues : invoice.selectedDues;
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
            .populate("projectIds");

        const projectNames = populatedInvoice.projectIds?.map(p => p.projectName).join(" & ") || "Unknown";

        res.status(200).json({
            message: "Invoice updated successfully",
            invoice: {
                ...populatedInvoice.toObject(),
                id: populatedInvoice._id,
                number: populatedInvoice.invoiceNo,
                projectName: projectNames,
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
        const projects = await projectModel.find({ _id: { $in: invoice.projectIds } });
        let projectsSummary = [];
        for (const project of projects) {
            const projectInvoices = await invoiceModel.find({ projectIds: project._id });
            const totalPaid = projectInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
            projectsSummary.push({
                ...project.toObject(),
                totalPaid,
                dueAmount: project.totalAmount - totalPaid
            });
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
            projects: projectsSummary
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
