import express from 'express';
import {
    register, login, verifyEmail,
    forgotPassword, resetPassword,
    listUsers, adminCreateUser, updateUserRole,
    updateUser, toggleUserActive, deleteUser,
    deleteSelf
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Customer — DPDP right to erasure (self-initiated account deletion)
router.delete('/me', protect, deleteSelf);

// Admin — user management
router.get('/users', protect, admin, listUsers);
router.post('/users', protect, admin, adminCreateUser);
router.put('/users/:id', protect, admin, updateUser);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.put('/users/:id/active', protect, admin, toggleUserActive);
router.delete('/users/:id', protect, admin, deleteUser);

export default router;
