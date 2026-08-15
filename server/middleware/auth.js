import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, isActive: true, tokenVersion: true }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Account not active' });
        }

        // Replay attack mitigation: if the token's version doesn't match
        // the current version in the database, the token was issued before
        // a password reset or manual revocation and is no longer valid.
        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') next();
    else res.status(403).json({ error: 'Not authorized as admin' });
};
