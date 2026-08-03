import { getAvailableSlots } from '../utils/slotEngine.js';

export const getSlots = async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });
    const slots = await getAvailableSlots(date);
    res.json(slots);
};
