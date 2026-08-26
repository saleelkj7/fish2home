import dotenv from 'dotenv';
dotenv.config({ path: '../prisma/.env' });

// Sends email via Resend's HTTP API (https://resend.com) instead of raw
// SMTP. Render's free tier blocks outbound SMTP ports entirely, but this
// is a normal HTTPS call, so it works fine there.
const RESEND_API_URL = 'https://api.resend.com/emails';

const sendViaResend = async ({ to, subject, html }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || 'Fishtokri <onboarding@resend.dev>';

    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not set');
    }

    const res = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: fromAddress, to, subject, html })
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Resend API error ${res.status}: ${body}`);
    }
};

export const sendVerificationEmail = async (email, token) => {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    try {
        await sendViaResend({
            to: email,
            subject: 'Verify your Fishtokri Account',
            html: `<h1>Welcome to Fishtokri</h1><p>Click <a href="${link}">here</a> to verify your email!</p>`
        });
        console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
        console.log(`⚠️ Email delivery failed for ${email}:`, error.message);
        // The verification link is logged only so admins can manually verify
        // accounts during development/testing when SMTP isn't configured.
        // In production, ensure RESEND_API_KEY is set so this never appears.
        console.log(`🔗 Verification link (do not share): ${link}`);
    }
};

export const sendResetPasswordEmail = async (email, token) => {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    try {
        await sendViaResend({
            to: email,
            subject: 'Reset your Fishtokri password',
            html: `<h1>Reset your password</h1><p>Click <a href="${link}">here</a> to set a new password. This link expires in 1 hour.</p><p>If you didn't request this, you can ignore this email.</p>`
        });
        console.log(`✅ Password reset email sent to ${email}`);
    } catch (error) {
        console.log(`⚠️ Email delivery failed for ${email}:`, error.message);
        console.log(`🔗 Reset link (do not share): ${link}`);
    }
};
