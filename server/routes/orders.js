import express from 'express';
import { createOrder, getMyOrders, updateOrderStatus, updatePaymentStatus, getInvoice, deleteOrder } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Customer Routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id/invoice', protect, getInvoice);

// Admin Routes
router.get('/all', protect, admin, async (req, res) => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const orders = await prisma.order.findMany({
        include: { user: true, address: true, deliverySlot: true, items: { include: { fish: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
});

router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/payment-status', protect, admin, updatePaymentStatus);
router.delete('/:id', protect, admin, deleteOrder);

export default router;
