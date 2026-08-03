import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load the .env file located in this folder
dotenv.config({ path: './.env' });

const prisma = new PrismaClient();

async function main() {
    const cat1 = await prisma.category.upsert({ where: { name: 'Fin Fish' }, update: {}, create: { name: 'Fin Fish' } });
    const cat2 = await prisma.category.upsert({ where: { name: 'Shellfish' }, update: {}, create: { name: 'Shellfish' } });

    const fishes = [
        { name: 'Pomfret (White)', scientificName: 'Pampus argenteus', price: 1200, stock: 20, freshness: 'Fresh Arabian Sea Catch', categoryId: cat1.id },
        { name: 'Surmai (King Fish)', scientificName: 'Scomberomorus commerson', price: 850, stock: 15, freshness: 'Premium Quality', categoryId: cat1.id },
        { name: 'Bombil (Bombay Duck)', scientificName: 'Harpadon nehereus', price: 300, stock: 30, freshness: 'Soft & Fresh', categoryId: cat1.id },
        { name: 'Prawns (Medium)', scientificName: 'Penaeus monodon', price: 600, stock: 25, freshness: 'Cleaned & Deveined', categoryId: cat2.id },
        { name: 'Mud Crab', scientificName: 'Scylla serrata', price: 1500, stock: 10, freshness: 'Live & Active', categoryId: cat2.id },
        { name: 'Mackerel (Bangda)', scientificName: 'Rastrelliger kanagurta', price: 250, stock: 40, freshness: 'Daily Catch', categoryId: cat1.id }
    ];

    for (const fish of fishes) {
        await prisma.fish.create({ data: fish });
    }
    console.log('✅ Seed data inserted successfully!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
