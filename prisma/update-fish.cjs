const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './.env' });
const prisma = new PrismaClient();

async function main() {
    const updates = [
        { name: 'Mackerel (Bangda)', price: 360, description: 'Firm, oily mackerel packed with flavour and omega-3. Great stuffed with green masala.', freshness: 'Caught Today' },
        { name: 'Mud Crab', price: 780, description: 'Live-caught mud crabs with sweet, succulent meat. Perfect for a classic Malvani crab curry or masala roast.', freshness: 'Live Caught Today' },
        { name: 'Pomfret (White)', price: 1150, description: 'Silver pomfret with delicate white flesh and very few bones. The festive favourite for tawa fry.', freshness: 'Fresh Today' },
        { name: 'Surmai (King Fish)', price: 980, description: 'Premium kingfish steaks, meaty and almost boneless. The king of the tawa fry.', freshness: 'Fresh Today' },
        { name: 'Bombil (Bombay Duck)', price: 420, description: 'Soft, delicate Bombil, cleaned and ready for the classic rava fry. Best eaten the same day.', freshness: 'Fresh Today' }
    ];
    for (const u of updates) {
        await prisma.fish.updateMany({ where: { name: u.name }, data: { price: u.price, description: u.description, freshness: u.freshness } });
    }
    console.log('✅ Fish details updated to match reference site!');
}
main().finally(() => prisma.$disconnect());
