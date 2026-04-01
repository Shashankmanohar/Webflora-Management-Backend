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
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email credentials missing from environment!');
            return { success: false, error: 'Email credentials not configured' };
        }

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
                <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #ff4e1b; color: white; padding: 35px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Welcome to the Team!</h1>
                    </div>
                    <div style="padding: 40px;">
                        <p style="font-size: 18px;">Hi <strong>${name}</strong>,</p>
                        <p>You've been officially onboarded as an <strong>${role}</strong> at Webflora Technologies. We're excited to have you with us!</p>
                        
                        <div style="background-color: #fef2f2; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #fee2e2;">
                            <p style="margin: 0 0 15px 0; font-weight: 800; color: #991b1b; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">Your Login Credentials</p>
                            <p style="margin: 5px 0; font-size: 15px;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 5px 0; font-size: 15px;"><strong>Temporary Password:</strong> <code style="background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #fca5a5;">${password}</code></p>
                        </div>

                        <div style="background-color: #fffbeb; padding: 15px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">Security Reminder: Please change your password immediately after your first login via the dashboard settings.</p>
                        </div>
                        
                        <div style="text-align: center; margin-bottom: 20px;">
                            <a href="${frontendUrl}/login" style="background-color: #ff4e1b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(255, 78, 27, 0.2);">Access Your Dashboard</a>
                        </div>

                        <p style="font-size: 14px; text-align: center; color: #6b7280;">If you have any trouble logging in, please contact the IT department.</p>
                    </div>
                    <div style="background-color: #f9fafb; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid #f1f5f9;">
                        &copy; ${new Date().getFullYear()} Webflora Technologies &bull; Better Work, Better Life.
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

/**
 * Sends a project handover notification to a staff member
 * @param {Object} data - Handover details (email, name, projectTitle, deadline, instructions)
 */
export const sendHandoverEmail = async (data) => {
    try {
        const { email, name, projectTitle, deadline, instructions } = data;
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const frontendUrl = 'https://webflora-management-frontend.vercel.app';
        const formattedDeadline = deadline ? new Date(deadline).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Flexible';
        
        const mailOptions = {
            from: `"Webflora Projects" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `New Project Assigned: ${projectTitle}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #ff4e1b; color: white; padding: 35px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">New Assignment!</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">A new project has been handed over to you.</p>
                    </div>
                    <div style="padding: 40px;">
                        <p style="font-size: 18px;">Hello <strong>${name}</strong>,</p>
                        <p>You have been assigned as the lead for the following project. Please review the details below:</p>
                        
                        <div style="background-color: #fff7ed; padding: 25px; border-radius: 16px; margin: 30px 0; border: 1px solid #ffedd5;">
                            <div style="margin-bottom: 20px;">
                                <span style="display: block; text-transform: uppercase; font-size: 10px; font-weight: 800; color: #c2410c; letter-spacing: 0.1em; margin-bottom: 4px;">Project Title</span>
                                <strong style="font-size: 22px; color: #0f172a;">${projectTitle}</strong>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <span style="display: block; text-transform: uppercase; font-size: 10px; font-weight: 800; color: #c2410c; letter-spacing: 0.1em; margin-bottom: 4px;">Deadline</span>
                                <span style="font-size: 16px; color: #ea580c; font-weight: 700;">${formattedDeadline}</span>
                            </div>

                            ${instructions ? `
                            <div>
                                <span style="display: block; text-transform: uppercase; font-size: 10px; font-weight: 800; color: #c2410c; letter-spacing: 0.1em; margin-bottom: 4px;">Instructions</span>
                                <p style="margin: 0; font-size: 14px; color: #431407; font-style: italic;">"${instructions}"</p>
                            </div>
                            ` : ''}
                        </div>

                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${frontendUrl}/handovers" style="background-color: #ff4e1b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(255, 78, 27, 0.2);">Explore Project</a>
                        </div>

                        <div style="border-top: 1px solid #f1f5f9; padding-top: 25px; margin-top: 25px;">
                            <p style="color: #64748b; font-size: 13px; font-weight: 500;">Don't forget to update your daily activity logs for this project in the dashboard.</p>
                        </div>
                    </div>
                    <div style="background-color: #f9fafb; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid #f1f5f9;">
                        &copy; ${new Date().getFullYear()} Webflora Technologies &bull; Delivering Innovation
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Handover email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending handover email:', error);
        return { success: false, error: error.message };
    }
};
