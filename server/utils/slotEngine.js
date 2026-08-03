import prisma from '../config/db.js';

export const getAvailableSlots = async (targetDateStr) => {
    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isToday = targetDate.getTime() === today.getTime();

    const slotsDef = [
        { start: 7, end: 10 }, { start: 10, end: 13 },
        { start: 13, end: 16 }, { start: 16, end: 19 }
    ];

    let dbSlots = await prisma.deliverySlot.findMany({ where: { date: targetDate } });

    // Auto-create slots if they don't exist for this date
    if (dbSlots.length === 0) {
        for (const def of slotsDef) {
            await prisma.deliverySlot.create({
                data: { date: targetDate, startTime: def.start, endTime: def.end }
            });
        }
        dbSlots = await prisma.deliverySlot.findMany({ where: { date: targetDate } });
    }

    return slotsDef.map(def => {
        const dbSlot = dbSlots.find(s => s.startTime === def.start);
        let isTimePassed = false;
        if (isToday && now.getHours() >= def.start) isTimePassed = true;

        const isFull = dbSlot ? dbSlot.currentOrders >= dbSlot.maxOrders : false;
        const fmtTime = (h) => `${h === 12 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`;

        return {
            id: dbSlot?.id,
            date: targetDate.toISOString().split('T')[0],
            startTime: def.start,
            endTime: def.end,
            label: `${fmtTime(def.start)} - ${fmtTime(def.end)}`,
            isAvailable: !isTimePassed && !isFull,
            isFull, isTimePassed
        };
    });
};
