import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { sendVerificationEmail } from '../utils/emailService.js';

export const register = async (req, res) => {
    const { firstName, lastName, email, mobile, password } = req.body;
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(403).json({ error: 'Please verify your email first.' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role } });
};
