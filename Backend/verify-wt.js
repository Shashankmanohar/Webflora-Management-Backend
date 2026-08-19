import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Counter from './model/counterModel.js';

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const year = new Date().getFullYear();

        // Check Client Reference
        const clientCounter = await Counter.findOneAndUpdate(
            { id: "clientReference" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        console.log(`Generated Client Ref: WT-REF-${String(clientCounter.seq).padStart(4, '0')}`);

        // Check Invoice Number
        const invCounter = await Counter.findOneAndUpdate(
            { id: `invoiceNumber-${year}` },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        console.log(`Generated Invoice No: WT-INV-${year}-${String(invCounter.seq).padStart(4, '0')}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
