import prisma from '../config/db.js';

export const getFishes = async (req, res) => {
    const fishes = await prisma.fish.findMany({ include: { category: true } });
    res.json(fishes);
};
