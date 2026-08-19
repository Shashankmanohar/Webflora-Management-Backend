import { sendWelcomeEmail } from '../utils/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

const testEmail = async () => {
    console.log('Starting email test...');
    const result = await sendWelcomeEmail(
        'webfloratechnologies@gmail.com', // Sending to self for testing
        'TempPass123!',
        'Test User',
        'employee'
    );
    
    if (result.success) {
        console.log('Test PASSED: Email sent successfully!');
    } else {
        console.error('Test FAILED:', result.error);
    }
};

testEmail();
