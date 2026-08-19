import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { jsPDF } from 'jspdf';
import Agreement from './model/agreementModel.js';
import fs from 'fs';

dotenv.config();

// Standard format helper fallback
const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN");
};

const testPdfGenerate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const agreement = await Agreement.findOne({}).sort({ createdAt: -1 });
        if (!agreement) {
            console.log("No agreements found.");
            process.exit(0);
        }

        console.log(`Generating PDF for ${agreement.agreementId}...`);

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = doc.internal.pageSize.getWidth(); // 210
        const pageHeight = doc.internal.pageSize.getHeight(); // 297
        const cardWidth = pageWidth - 48; // 162
        
        let fontSize = 8.5;
        let lineSpacing = 4.4;
        let partyCardHeight = 25;
        let durationCardHeight = 20;
        let financialCardHeight = 32;
        let gapSpacing = 5;
        let textLineHeight = 1.35;

        let y = 59;

        const printParagraph = (lines, x, lineSpacingVal) => {
            for (const line of lines) {
                if (y + lineSpacingVal > pageHeight - 22) {
                    doc.addPage();
                    y = 23;
                }
                doc.text(line, x, y);
                y += lineSpacingVal;
            }
        };

        const techStackArray = agreement.projectInfo?.techStack || [];
        const featuresArray = agreement.projectInfo?.featuresIncluded || [];
        const deliverablesArray = agreement.projectInfo?.deliverables || [];

        // Simple mock scope text
        const scopeText = "This is a mock scope text of the agreement project scope.";
        const projectScopeDescVal = agreement.projectInfo?.description || "Mock description";

        doc.text("TECHNICAL SCOPE & CLIENT DELIVERABLES", 24, y);
        y += 5.5;

        doc.text("Project Title : " + (agreement.projectInfo?.title || "Mock Title"), 24, y);
        y += 5;

        const splitScopeDesc = doc.splitTextToSize(projectScopeDescVal, cardWidth);
        printParagraph(splitScopeDesc, 24, lineSpacing);
        y += 4.5;

        doc.text("1. Scope of Work:", 24, y);
        y += 4;

        const splitScope = doc.splitTextToSize(scopeText, cardWidth);
        printParagraph(splitScope, 24, lineSpacing);
        y += gapSpacing;

        console.log("Printing Tech Stack array:", techStackArray);

        // Render Tech Stack
        if (techStackArray.length > 0) {
            if (y + 6 > pageHeight - 22) {
                doc.addPage();
                y = 23;
            }
            doc.text("Technologies Utilized:", 24, y);
            const techText = techStackArray.join(", ");
            const wrappedTech = doc.splitTextToSize(techText, cardWidth - 42);
            doc.text(wrappedTech, 66, y);
            y += wrappedTech.length * (fontSize * 0.4) + 2.5;
        }

        // Helper for bullet lists
        const drawBulletList = (title, items, currentY) => {
            if (!items || items.length === 0) return currentY;
            
            if (currentY + 8 > pageHeight - 22) {
                doc.addPage();
                currentY = 23;
            }
            
            doc.text(title + ":", 24, currentY);
            currentY += 4.5;
            
            items.forEach((item) => {
                const wrappedItem = doc.splitTextToSize("•  " + item, cardWidth - 6);
                for (const line of wrappedItem) {
                    if (currentY + fontSize * 0.42 > pageHeight - 22) {
                        doc.addPage();
                        currentY = 23;
                    }
                    doc.text(line, 28, currentY);
                    currentY += lineSpacing;
                }
            });
            
            return currentY + 2.5;
        };

        // Render Key Features
        if (featuresArray.length > 0) {
            console.log("Printing Features array:", featuresArray);
            y = drawBulletList("Key Features Included", featuresArray, y);
        }

        // Render Deliverables
        if (deliverablesArray.length > 0) {
            console.log("Printing Deliverables array:", deliverablesArray);
            y = drawBulletList("Project Key Deliverables", deliverablesArray, y);
        }

        const buffer = doc.output('arraybuffer');
        fs.writeFileSync('test.pdf', Buffer.from(buffer));
        console.log("✓ PDF generated successfully as test.pdf");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testPdfGenerate();
