import Client from "../model/clientModel.js";

// Add Client
const Addclients = async (req, res) => {
    try {
        const { clientName, contactNumber, email, address, referenceNo } = req.body;

        if (!clientName || !contactNumber || !email || !address || !referenceNo) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingClient = await Client.findOne({
            $or: [{ email }, { contactNumber }],
        });

        if (existingClient) {
            return res.status(409).json({ message: "Client already exists!" });
        }

        const newClient = new Client({
            clientName,
            contactNumber,
            email,
            address,
            referenceNo
        });

        await newClient.save();

        res.status(201).json({
            message: "Client created successfully",
            client: newClient
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create client", error: error.message });
    }
};


// Get All Clients
const getAllClient = async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).json({ clients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get clients", error: error.message });
    }
};


const updatedClient = async (req, res) => {
    try {
        const { id } = req.params;
        let { clientName, contactNumber, email, address, referenceNo } = req.body;

        // Find client first
        const client = await Client.findById(id);
        if (!client) {
            return res.status(404).json({ message: "Client not found!" });
        }

        // Update only provided fields
        client.clientName = clientName || client.clientName;
        client.contactNumber = contactNumber || client.contactNumber;
        client.email = email || client.email;
        client.address = address || client.address;
        client.referenceNo = referenceNo || client.referenceNo;

        // Save updated data
        await client.save();

        res.status(200).json({
            message: "Client updated successfully",
            client: {
                _id: client._id,
                clientName: client.clientName,
                contactNumber: client.contactNumber,
                email: client.email,
                address: client.address,
                referenceNo: client.referenceNo
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update client",
            error: error.message
        });
    }
};


// Delete Client
const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await Client.findByIdAndDelete(id);

        if (!client) {
            return res.status(404).json({ message: "Client not found!" });
        }

        res.status(200).json({ message: "Client deleted successfully", client });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete client", error: error.message });
    }
};


export { Addclients, getAllClient, updatedClient, deleteClient };

