import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agreement from './model/agreementModel.js';

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const latest = await Agreement.findOne({}).sort({ createdAt: -1 });
        if (!latest) {
            console.log("No agreements found.");
            process.exit(0);
        }

        console.log("-----------------------------------------");
        console.log(`LATEST AGREEMENT ID: ${latest.agreementId}`);
        console.log("STATUS:", latest.status);
        console.log("PROJECT INFO:", JSON.stringify(latest.projectInfo, null, 2));
        console.log("PAYMENT INFO:", JSON.stringify(latest.payment, null, 2));
        console.log("-----------------------------------------");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
