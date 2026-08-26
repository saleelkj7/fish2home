require("dotenv").config({ path: "./.env" });
const { PrismaClient } = require("../server/node_modules/@prisma/client");
const p = new PrismaClient();

async function main() {
    const orders = await p.order.findMany({ where: { invoiceUrl: { startsWith: "/invoices/" } } });
    console.log("Orders with old invoice paths:", orders.length);
    for (const o of orders) {
        await p.order.update({ where: { id: o.id }, data: { invoiceUrl: "/api/orders/" + o.id + "/invoice" } });
        console.log("Fixed:", o.orderNumber);
    }
}

main().catch(e => console.error("Error:", e.message)).finally(() => p.$disconnect());