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
            from: `"Fish2Home" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your Fish2Home Account',
            html: `<h1>Welcome to Fish2Home</h1><p>Click <a href="${link}">here</a> to verify your email!</p>`
        });
        console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
        console.log(`\n⚠️ SMTP Email failed (Gmail requires App Password).`);
        console.log(`🔗 VERIFY ACCOUNT MANUALLY BY OPENING THIS LINK IN YOUR BROWSER:`);
        console.log(`👉 ${link}\n`);
    }
};
