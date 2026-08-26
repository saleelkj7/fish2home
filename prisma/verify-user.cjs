require("dotenv").config({ path: "./.env" });
const { PrismaClient } = require("../server/node_modules/@prisma/client");
const p = new PrismaClient();
p.user.update({
    where: { email: "saleelkj@gmail.com" },
    data: { isEmailVerified: true, isActive: true }
}).then(u => console.log("Activated:", u.email))
  .catch(e => console.error("Error:", e.message))
  .finally(() => p.$disconnect());