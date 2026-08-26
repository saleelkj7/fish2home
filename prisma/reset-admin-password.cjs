require("dotenv").config({ path: "./.env" });
const { PrismaClient } = require("../server/node_modules/@prisma/client");
const bcrypt = require("bcryptjs");
const p = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("Fishtokri@2026", 10);
    const user = await p.user.update({
        where: { email: "admin@fishtokri.co.in" },
        data: { password: hashedPassword, isActive: true, isEmailVerified: true }
    });
    console.log("Password reset for:", user.email);
}

main().catch(e => console.error("Error:", e.message)).finally(() => p.$disconnect());