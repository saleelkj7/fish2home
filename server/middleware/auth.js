import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer')) {
        try {
            const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
            req.user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, role: true, isActive: true } });
            if (!req.user || !req.user.isActive) return res.status(401).json({ error: 'Account not active' });
            next();
        } catch (error) {
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') next();
    else res.status(403).json({ error: 'Not authorized as admin' });
};
