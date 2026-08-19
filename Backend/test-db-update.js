import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agreement from './model/agreementModel.js';

dotenv.config();

const testUpdate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        // Find any agreement
        const agreement = await Agreement.findOne({});
        if (!agreement) {
            console.log("No agreements found to test update!");
            process.exit(0);
        }

        console.log(`Found agreement: ${agreement.agreementId}`);
        console.log("Current payment values:", agreement.payment);

        // Modify payment fields
        const newRefundPolicy = "Edited Refund Policy " + Date.now();
        const newPrivacyPolicy = "Edited Privacy Policy " + Date.now();

        console.log("Updating agreement with new payment fields...");
        
        // Simulating the update structure sent by frontend
        const updatedData = {
            payment: {
                ...agreement.payment.toObject(),
                refundPolicy: newRefundPolicy,
                privacyPolicy: newPrivacyPolicy
            }
        };

        const updated = await Agreement.findByIdAndUpdate(agreement._id, updatedData, { new: true });
        console.log("Updated payment values:", updated.payment);

        if (updated.payment.refundPolicy === newRefundPolicy && updated.payment.privacyPolicy === newPrivacyPolicy) {
            console.log("✓ SUCCESS: Database updated and saved the new values correctly!");
        } else {
            console.log("✗ FAILED: Database did not save the new values!");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testUpdate();
