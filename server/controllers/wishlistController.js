import prisma from '../config/db.js';

export const getWishlist = async (req, res) => {
    const items = await prisma.wishlist.findMany({
        where: { userId: req.user.id },
        include: { fish: { include: { category: true } } },
        orderBy: { id: 'desc' }
    });
    res.json(items);
};

export const addToWishlist = async (req, res) => {
    const { fishId } = req.body;
    if (!fishId) return res.status(400).json({ error: 'fishId is required' });
    try {
        const item = await prisma.wishlist.create({
            data: { userId: req.user.id, fishId: parseInt(fishId) },
            include: { fish: true }
        });
        res.status(201).json(item);
    } catch (err) {
        // Unique constraint — already in wishlist
        res.status(400).json({ error: 'Already in wishlist' });
    }
};

export const removeFromWishlist = async (req, res) => {
    const { fishId } = req.params;
    try {
        await prisma.wishlist.deleteMany({
            where: { userId: req.user.id, fishId: parseInt(fishId) }
        });
        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
};
