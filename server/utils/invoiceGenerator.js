import PDFDocument from 'pdfkit';

// Builds the invoice PDF entirely in memory and resolves with a Buffer.
// Render's free tier wipes its filesystem on every redeploy/restart, so
// invoices are generated on-demand each time they're requested rather
// than saved to disk — that way they survive deploys indefinitely since
// they're rebuilt fresh from the order data in the database every time.
export const generateInvoiceBuffer = (order) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(25).text('Fishtokri', { align: 'right' });
        doc.fontSize(10).text('Fresh Fish Delivered to Your Doorstep', { align: 'right' });
        doc.moveDown(2);
        doc.fontSize(18).text('INVOICE', { align: 'left' });
        doc.fontSize(10).text(`Invoice No: INV-${order.id}`);
        doc.text(`Order No: ${order.orderNumber}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`);
        doc.moveDown();

        doc.fontSize(12).text('Bill To:', { underline: true });
        doc.fontSize(10).text(order.address.name);
        doc.text(order.address.address);
        doc.text(`${order.address.landmark || ''}, ${order.address.pincode}`);
        doc.text(`Phone: ${order.address.mobile}`);
        doc.moveDown();

        doc.fontSize(12).text('Order Items:', { underline: true });
        let y = doc.y + 10;
        doc.fontSize(10).text('Item', 50, y); doc.text('Qty', 300, y); doc.text('Price', 400, y); doc.text('Total', 500, y);
        doc.moveDown(1.5);

        order.items.forEach(item => {
            doc.text(item.fish.name, 50); doc.text(item.quantity.toString(), 300);
            doc.text(`₹${item.price}`, 400); doc.text(`₹${item.price * item.quantity}`, 500);
        });

        doc.moveDown(2);
        doc.fontSize(12).text('Summary', { underline: true });
        const gst = order.totalAmount * 0.05;
        doc.fontSize(10).text(`Subtotal: ₹${(order.totalAmount - gst).toFixed(2)}`);
        doc.text(`GST (5%): ₹${gst.toFixed(2)}`);
        doc.moveDown();
        doc.fontSize(12).text(`Grand Total: ₹${order.totalAmount}`, { bold: true });
        doc.text(`Amount Due (Cash/UPI at Delivery): ₹${order.balanceAmount}`, { color: 'red' });

        doc.end();
    });
};
