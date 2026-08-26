require("dotenv").config({ path: "./.env" });
const { PrismaClient } = require("../server/node_modules/@prisma/client");
const p = new PrismaClient();
p.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, isEmailVerified: true, isActive: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" }
}).then(users => {
    console.log("Total users:", users.length);
    users.forEach(u => console.log(u.id, "|", u.email, "| verified:", u.isEmailVerified, "| active:", u.isActive, "| role:", u.role, "|", u.createdAt));
}).finally(() => p.$disconnect());