import prisma from '../config/db.js';

// Customer: validate a coupon code and return discount details
export const validateCoupon = async (req, res) => {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required.' });

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

    if (!coupon || !coupon.isActive) return res.status(404).json({ error: 'Invalid or expired coupon code.' });
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) return res.status(400).json({ error: 'This coupon has expired.' });
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return res.status(400).json({ error: 'This coupon has reached its usage limit.' });
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
        return res.status(400).json({ error: `Minimum order amount of Rs. ${coupon.minOrderAmount} required for this coupon.` });
    }

    const rawDiscount = (orderAmount * coupon.discountPercentage) / 100;
    const discount = coupon.maxDiscountAmount ? Math.min(rawDiscount, coupon.maxDiscountAmount) : rawDiscount;

    res.json({
        valid: true,
        couponId: coupon.id,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discountAmount: Math.round(discount * 100) / 100,
        finalAmount: Math.round((orderAmount - discount) * 100) / 100
    });
};

// Admin: list all coupons
export const listCoupons = async (req, res) => {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(coupons);
};

// Admin: create a new coupon
export const createCoupon = async (req, res) => {
    const { code, discountPercentage, maxDiscountAmount, minOrderAmount, usageLimit, expiresAt } = req.body;
    if (!code || !discountPercentage) return res.status(400).json({ error: 'Code and discount percentage are required.' });
    if (discountPercentage <= 0 || discountPercentage > 100) return res.status(400).json({ error: 'Discount must be between 1 and 100 percent.' });

    try {
        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase().trim(),
                discountPercentage: parseFloat(discountPercentage),
                maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
                minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });
        res.status(201).json(coupon);
    } catch (err) {
        if (err.code === 'P2002') return res.status(400).json({ error: 'A coupon with this code already exists.' });
        res.status(500).json({ error: 'Failed to create coupon.' });
    }
};

// Admin: toggle active/inactive
export const toggleCoupon = async (req, res) => {
    const { id } = req.params;
    try {
        const coupon = await prisma.coupon.findUnique({ where: { id: parseInt(id) } });
        const updated = await prisma.coupon.update({ where: { id: parseInt(id) }, data: { isActive: !coupon.isActive } });
        res.json(updated);
    } catch {
        res.status(500).json({ error: 'Failed to update coupon.' });
    }
};

// Admin: delete a coupon
export const deleteCoupon = async (req, res) => {
    try {
        await prisma.coupon.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Coupon deleted.' });
    } catch {
        res.status(500).json({ error: 'Failed to delete coupon.' });
    }
};
