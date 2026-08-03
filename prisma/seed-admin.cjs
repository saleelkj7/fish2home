const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@fish2home.com' },
        update: {},
        create: {
            email: 'admin@fish2home.com',
            firstName: 'Admin',
            lastName: 'User',
            mobile: '9999999999',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
            isEmailVerified: true
        }
    });
    console.log('✅ Admin account created: admin@fish2home.com / Admin@123');
}
main().finally(() => prisma.$disconnect());
