import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Sends a welcome email to newly registered users (employees/interns)
 * @param {string} email - Recipient email
 * @param {string} password - Raw password (to be shown once)
 * @param {string} name - User's name
 * @param {string} role - User's role (employee/intern)
 */
export const sendWelcomeEmail = async (email, password, name, role) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const frontendUrl = 'https://webflora-management-frontend.vercel.app';
        
        const mailOptions = {
            from: `"Webflora Management" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Webflora Management System',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Welcome to Webflora!</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hi <strong>${name}</strong>,</p>
                        <p>You have been registered as an <strong>${role}</strong> in the Webflora Management System.</p>
                        
                        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                            <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${password}</p>
                        </div>

                        <p style="color: #ef4444; font-weight: bold;">Important: For security reasons, please change your password immediately after your first login.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${frontendUrl}/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
                        </div>

                        <p>If you have any questions, please contact the administrator.</p>
                        <p>Best regards,<br>The Webflora Team</p>
                    </div>
                    <div style="background-color: #f3f4f6; color: #6b7280; padding: 10px; text-align: center; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} Webflora technologies. All rights reserved.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};
