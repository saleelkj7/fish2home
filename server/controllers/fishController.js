import prisma from '../config/db.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';

export const getFishes = async (req, res) => {
    const fishes = await prisma.fish.findMany({ include: { category: true }, orderBy: { id: 'asc' } });
    res.json(fishes);
};

export const getCategories = async (req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
};

export const createFish = async (req, res) => {
    try {
        const { name, scientificName, price, stock, description, freshness, categoryId, categoryName } = req.body;
        if (!name || !price || !categoryId && !categoryName) {
            return res.status(400).json({ error: 'Name, price, and category are required.' });
        }

        let catId = categoryId ? parseInt(categoryId) : null;
        if (!catId && categoryName) {
            const cat = await prisma.category.upsert({
                where: { name: categoryName },
                update: {},
                create: { name: categoryName }
            });
            catId = cat.id;
        }

        let image = '/default-fish.jpg';
        if (req.file) {
            try {
                image = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype);
            } catch (uploadErr) {
                return res.status(500).json({ error: `Image upload failed: ${uploadErr.message}` });
            }
        }

        const fish = await prisma.fish.create({
            data: {
                name,
                scientificName: scientificName || null,
                price: parseFloat(price),
                stock: stock !== undefined ? parseInt(stock) : 0,
                description: description || null,
                freshness: freshness || null,
                image,
                categoryId: catId
            },
            include: { category: true }
        });
        res.status(201).json(fish);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateFish = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, scientificName, price, stock, description, freshness, categoryId } = req.body;

        const data = {};
        if (name !== undefined) data.name = name;
        if (scientificName !== undefined) data.scientificName = scientificName;
        if (price !== undefined) data.price = parseFloat(price);
        if (stock !== undefined) data.stock = parseInt(stock);
        if (description !== undefined) data.description = description;
        if (freshness !== undefined) data.freshness = freshness;
        if (categoryId !== undefined) data.categoryId = parseInt(categoryId);

        if (req.file) {
            try {
                data.image = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype);
            } catch (uploadErr) {
                return res.status(500).json({ error: `Image upload failed: ${uploadErr.message}` });
            }
        }

        const fish = await prisma.fish.update({
            where: { id: parseInt(id) },
            data,
            include: { category: true }
        });
        res.json(fish);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteFish = async (req, res) => {
    try {
        await prisma.fish.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Fish deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Could not delete — this fish may have existing orders linked to it.' });
    }
};
