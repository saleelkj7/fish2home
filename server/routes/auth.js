import express from 'express';
import {
    register, login, verifyEmail,
    forgotPassword, resetPassword,
    listUsers, adminCreateUser, updateUserRole
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Admin — user management
router.get('/users', protect, admin, listUsers);
router.post('/users', protect, admin, adminCreateUser);
router.put('/users/:id/role', protect, admin, updateUserRole);

export default router;
