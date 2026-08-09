import prisma from '../config/db.js';
import { generateInvoiceBuffer } from '../utils/invoiceGenerator.js';

const ALLOWED_PINCODES = ['400706', '400614', '400705'];

export const createOrder = async (req, res) => {
    const { addressData, deliverySlotId, items } = req.body;
    const userId = req.user.id;

    if (!ALLOWED_PINCODES.includes(addressData.pincode)) {
        return res.status(400).json({ error: "We currently do not deliver to this location. Delivery extending soon." });
    }

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
        const fish = await prisma.fish.findUnique({ where: { id: item.fishId } });
        if (!fish || fish.stock < item.quantity) return res.status(400).json({ error: `${fish?.name} is out of stock.` });
        subtotal += fish.price * item.quantity;
        orderItems.push({ fishId: fish.id, quantity: item.quantity, price: fish.price });
    }

    const gst = subtotal * 0.05;
    const totalAmount = subtotal + gst;
    // No advance payment — full amount is collected via cash or UPI at delivery.
    const advanceAmount = 0;
    const balanceAmount = totalAmount;

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await prisma.order.count() + 1;
    const orderNumber = `FTK-${dateStr}-${count.toString().padStart(5, '0')}`;

    const address = await prisma.address.create({ data: { ...addressData, userId } });

    const order = await prisma.order.create({
        data: {
            orderNumber, userId, addressId: address.id, deliverySlotId,
            totalAmount, advanceAmount, balanceAmount,
            items: { create: orderItems }
        },
        include: { items: { include: { fish: true } }, address: true }
    });

    for (const item of orderItems) {
        await prisma.fish.update({ where: { id: item.fishId }, data: { stock: { decrement: item.quantity } } });
    }
    await prisma.deliverySlot.update({ where: { id: deliverySlotId }, data: { currentOrders: { increment: 1 } } });

    const invoiceUrl = `/api/orders/${order.id}/invoice`;
    await prisma.order.update({ where: { id: order.id }, data: { invoiceUrl } });

    res.json({ order, invoiceUrl });
};

export const getInvoice = async (req, res) => {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: { items: { include: { fish: true } }, address: true }
    });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    // Only the order's owner or an admin can download its invoice.
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to view this invoice.' });
    }

    try {
        const buffer = await generateInvoiceBuffer(order);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="INV-${order.orderNumber}.pdf"`
        });
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate invoice.' });
    }
};

export const getMyOrders = async (req, res) => {
    const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: { include: { fish: true } }, address: true, deliverySlot: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { orderStatus: status }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
};

export const updatePaymentStatus = async (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    if (!['PENDING_ADVANCE', 'ADVANCE_VERIFIED', 'FULLY_PAID'].includes(paymentStatus)) {
        return res.status(400).json({ error: 'Invalid payment status.' });
    }
    try {
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { paymentStatus }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update payment status' });
    }
};

export const deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: { items: true }
        });
        if (!order) return res.status(404).json({ error: 'Order not found.' });

        // Restore stock for each item and free up the delivery slot capacity
        // before deleting, so cancelling/removing an order doesn't silently
        // strand inventory or slot counts.
        for (const item of order.items) {
            await prisma.fish.update({ where: { id: item.fishId }, data: { stock: { increment: item.quantity } } });
        }
        await prisma.deliverySlot.update({
            where: { id: order.deliverySlotId },
            data: { currentOrders: { decrement: 1 } }
        }).catch(() => {}); // slot may already be at 0 or deleted separately — not fatal

        await prisma.order.delete({ where: { id: parseInt(id) } }); // OrderItems cascade automatically
        res.json({ message: 'Order deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete order.' });
    }
};
