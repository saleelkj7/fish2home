import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '../prisma/.env' });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

export const sendVerificationEmail = async (email, token) => {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    try {
        await transporter.sendMail({
            from: `"Fishtokri" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your Fishtokri Account',
            html: `<h1>Welcome to Fishtokri</h1><p>Click <a href="${link}">here</a> to verify your email!</p>`
        });
        console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
        console.log(`\n⚠️ SMTP Email failed (Gmail requires App Password).`);
        console.log(`🔗 VERIFY ACCOUNT MANUALLY BY OPENING THIS LINK IN YOUR BROWSER:`);
        console.log(`👉 ${link}\n`);
    }
};

export const sendResetPasswordEmail = async (email, token) => {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    try {
        await transporter.sendMail({
            from: `"Fishtokri" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset your Fishtokri password',
            html: `<h1>Reset your password</h1><p>Click <a href="${link}">here</a> to set a new password. This link expires in 1 hour.</p><p>If you didn't request this, you can ignore this email.</p>`
        });
        console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
        console.log(`\n⚠️ SMTP Email failed (Gmail requires App Password).`);
        console.log(`🔗 RESET PASSWORD MANUALLY BY OPENING THIS LINK IN YOUR BROWSER:`);
        console.log(`👉 ${link}\n`);
    }
};
