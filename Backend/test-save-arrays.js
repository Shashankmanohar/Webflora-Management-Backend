import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Agreement from './model/agreementModel.js';

dotenv.config();

const testSave = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const latest = await Agreement.findOne({}).sort({ createdAt: -1 });
        if (!latest) {
            console.log("No agreements found.");
            process.exit(0);
        }

        console.log(`Updating ${latest.agreementId} with techStack, features, and deliverables...`);
        latest.projectInfo.techStack = ["React", "Node.js", "MongoDB"];
        latest.projectInfo.featuresIncluded = ["Auth", "Dashboard", "PDF Export"];
        latest.projectInfo.deliverables = ["Source Code", "Documentation"];

        await latest.save();

        // Reload from DB
        const reloaded = await Agreement.findById(latest._id);
        console.log("Reloaded Tech Stack:", reloaded.projectInfo.techStack);
        console.log("Reloaded Features:", reloaded.projectInfo.featuresIncluded);
        console.log("Reloaded Deliverables:", reloaded.projectInfo.deliverables);

        if (reloaded.projectInfo.techStack.length > 0) {
            console.log("✓ SUCCESS: Mongoose saved the arrays correctly!");
        } else {
            console.log("✗ FAILED: Mongoose cleared the arrays!");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testSave();
