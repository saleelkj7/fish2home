import prisma from '../config/db.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';

// Always a single row (id = 1). Falls back to sensible defaults if the
// row hasn't been created yet (e.g. brand-new deployment before an admin
// has ever saved settings).
export const getSettings = async (req, res) => {
    try {
        const settings = await prisma.settings.findUnique({ where: { id: 1 } });
        res.json({
            siteName: settings?.siteName || 'Fishtokri',
            logoUrl: settings?.logoUrl || null
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load settings' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const data = {};
        if (req.body.siteName !== undefined && req.body.siteName.trim() !== '') {
            data.siteName = req.body.siteName.trim();
        }
        if (req.file) {
            data.logoUrl = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype, 'fishtokri/branding');
        }

        const settings = await prisma.settings.upsert({
            where: { id: 1 },
            update: data,
            create: { id: 1, siteName: data.siteName || 'Fishtokri', logoUrl: data.logoUrl || null }
        });

        res.json({ siteName: settings.siteName, logoUrl: settings.logoUrl });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to update settings' });
    }
};
