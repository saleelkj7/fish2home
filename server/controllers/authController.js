import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validator from 'validator';
import prisma from '../config/db.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/emailService.js';
import { validatePassword, PASSWORD_POLICY, sanitiseBody } from '../utils/security.js';

export const register = async (req, res) => {
    const raw = sanitiseBody(req.body);
    const { firstName, lastName, email, mobile, password, consentGiven } = raw;

    if (!firstName || !lastName || !email || !mobile || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!validatePassword(password)) {
        return res.status(400).json({ error: PASSWORD_POLICY.message });
    }
    // Hard cap at 72 chars (bcrypt's internal limit) to prevent a DoS
    // where an attacker sends a massive password string to stall the CPU.
    if (password.length > 72) {
        return res.status(400).json({ error: PASSWORD_POLICY.message });
    }
    // DPDP Act compliance: explicit consent is required before creating an account.
    if (!consentGiven) {
        return res.status(400).json({ error: 'You must agree to the Privacy Policy and Terms of Service to register.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');

    await prisma.user.create({
        data: { firstName, lastName, email, mobile, password: hashedPassword, verificationToken: token }
    });

    await sendVerificationEmail(email, token);
    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
};

export const verifyEmail = async (req, res) => {
    const { token } = req.query;
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ error: 'Invalid token' });

    await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, isActive: true, verificationToken: null }
    });
    res.json({ message: 'Email verified successfully. You can now login.' });
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';

    if (!password || typeof password !== 'string' || password.length > 72) {
        await prisma.loginLog.create({ data: { email: email || '', ip, success: false, reason: 'Invalid password format' } }).catch(() => {});
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        await prisma.loginLog.create({ data: { email: email || '', ip, success: false, reason: 'Invalid credentials', userId: user?.id || null } }).catch(() => {});
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isBlacklisted) {
        await prisma.loginLog.create({ data: { email, ip, success: false, reason: 'Blacklisted', userId: user.id } }).catch(() => {});
        return res.status(403).json({ error: `Your account has been suspended. Reason: ${user.blacklistReason || 'Contact support at vaibhav@fishtokri.co.in'}` });
    }

    if (!user.isActive) {
        await prisma.loginLog.create({ data: { email, ip, success: false, reason: 'Inactive', userId: user.id } }).catch(() => {});
        return res.status(403).json({ error: user.isEmailVerified ? 'Your account has been deactivated. Please contact support.' : 'Please verify your email first.' });
    }

    await prisma.loginLog.create({ data: { email, ip, success: true, userId: user.id } }).catch(() => {});

    // Determine if this is the user's first ever successful login
    const previousLogins = await prisma.loginLog.count({ where: { userId: user.id, success: true } });
    const isFirstLogin = previousLogins <= 1; // <= 1 because we just created one above

    const token = jwt.sign(
        { id: user.id, role: user.role, tokenVersion: user.tokenVersion },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
    res.json({ token, isFirstLogin, user: { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role } });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same response whether or not the email exists,
    // so this endpoint can't be used to check which emails are registered.
    if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await prisma.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpiry: expiry } });
        await sendResetPasswordEmail(email, token);
    }
    res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
};

export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password || !validatePassword(password)) {
        return res.status(400).json({ error: `A valid token and a valid password are required. ${PASSWORD_POLICY.message}` });
    }
    const user = await prisma.user.findFirst({ where: { resetToken: token, resetTokenExpiry: { gt: new Date() } } });
    if (!user) return res.status(400).json({ error: 'This reset link is invalid or has expired. Please request a new one.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
            isEmailVerified: true,
            isActive: true,
            tokenVersion: { increment: 1 } // invalidates all tokens issued before this reset
        }
    });
    res.json({ message: 'Password reset successful. You can now log in.' });
};

// ---- Admin: user management ----

export const listUsers = async (req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, firstName: true, lastName: true, email: true, mobile: true, role: true, isActive: true, isEmailVerified: true, isBlacklisted: true, blacklistReason: true, blacklistedAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json(users);
};

export const adminCreateUser = async (req, res) => {
    const { firstName, lastName, email, mobile, password, role } = req.body;
    if (!firstName || !lastName || !email || !mobile || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'A user with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            firstName, lastName, email, mobile, password: hashedPassword,
            role: role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
            isActive: true, isEmailVerified: true // admin-created accounts skip email verification
        }
    });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
};

export const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'CUSTOMER'].includes(role)) return res.status(400).json({ error: 'Invalid role.' });

    const user = await prisma.user.update({ where: { id: parseInt(id) }, data: { role } });
    res.json({ id: user.id, email: user.email, role: user.role });
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, mobile } = req.body;

    if (email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== parseInt(id)) {
            return res.status(400).json({ error: 'Another user already uses this email.' });
        }
    }

    try {
        const data = {};
        if (firstName !== undefined) data.firstName = firstName;
        if (lastName !== undefined) data.lastName = lastName;
        if (email !== undefined) data.email = email;
        if (mobile !== undefined) data.mobile = mobile;

        const user = await prisma.user.update({ where: { id: parseInt(id) }, data });
        res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, mobile: user.mobile });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user.' });
    }
};

export const toggleUserActive = async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    try {
        const user = await prisma.user.update({ where: { id: parseInt(id) }, data: { isActive: !!isActive } });
        res.json({ id: user.id, isActive: user.isActive });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user.' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'User permanently deleted.' });
    } catch (err) {
        // Users with existing orders/addresses can't be hard-deleted without
        // breaking order history — deactivate instead in that case.
        res.status(400).json({
            error: 'This user has existing orders and cannot be permanently deleted (that would break order history). Deactivate the account instead.'
        });
    }
};

// DPDP Act, 2023 — Right to Erasure: a logged-in customer can request
// deletion of their own account. If they have existing orders we
// anonymise their personal data rather than hard-deleting (to preserve
// order history for legal/accounting purposes), then delete the account.
export const deleteSelf = async (req, res) => {
    const userId = req.user.id;
    try {
        // Anonymise any linked addresses so order history stays intact
        // but personal contact details are removed.
        await prisma.address.updateMany({
            where: { userId },
            data: { name: 'Deleted User', mobile: '0000000000', address: '[redacted]', landmark: '', pincode: '000000' }
        });

        try {
            await prisma.user.delete({ where: { id: userId } });
        } catch {
            // If delete fails (e.g. DB constraint), anonymise in-place instead.
            await prisma.user.update({
                where: { id: userId },
                data: {
                    firstName: 'Deleted', lastName: 'User',
                    email: `deleted-${userId}-${Date.now()}@fishtokri.co.in`,
                    mobile: '0000000000',
                    password: 'DELETED',
                    isActive: false,
                    verificationToken: null,
                    resetToken: null,
                    resetTokenExpiry: null
                }
            });
        }
        res.json({ message: 'Your account and personal data have been deleted. Thank you for using Fishtokri.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete account. Please email vaibhav@fishtokri.co.in to request manual deletion.' });
    }
};

export const blacklistUser = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { isBlacklisted: true, blacklistReason: reason || 'No reason provided', blacklistedAt: new Date(), isActive: false, tokenVersion: { increment: 1 } }
        });
        res.json({ id: user.id, isBlacklisted: user.isBlacklisted, blacklistReason: user.blacklistReason });
    } catch (err) {
        res.status(500).json({ error: 'Failed to blacklist user.' });
    }
};

export const unblacklistUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { isBlacklisted: false, blacklistReason: null, blacklistedAt: null, isActive: true }
        });
        res.json({ id: user.id, isBlacklisted: user.isBlacklisted });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove blacklist.' });
    }
};

export const getLoginLogs = async (req, res) => {
    const logs = await prisma.loginLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: { user: { select: { firstName: true, lastName: true } } }
    });
    res.json(logs);
};
