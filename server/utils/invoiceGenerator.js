import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

// Fixed column x-positions for the items table, used consistently for
// both the header row and every item row so everything lines up.
const COL = { item: 50, qty: 300, price: 380, total: 460 };
const COL_WIDTH = { qty: 70, price: 70, total: 90 };
const PAGE_RIGHT = 550;

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

        // ---- Header: logo top-left, invoice title/meta top-right ----
        try {
            doc.image(LOGO_PATH, 50, 45, { width: 130 });
        } catch (e) {
            // If the logo can't be loaded for any reason, fall back to text
            // rather than failing the whole invoice.
            doc.fontSize(20).font('Helvetica-Bold').text('Fishtokri', 50, 50);
        }

        doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 0, 50, { align: 'right' });
        doc.fontSize(9).font('Helvetica').fillColor('#555')
            .text(`Invoice No: INV-${order.id}`, { align: 'right' })
            .text(`Order No: ${order.orderNumber}`, { align: 'right' })
            .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, { align: 'right' });
        doc.fillColor('#000');

        doc.y = 130;
        doc.moveTo(50, doc.y).lineTo(PAGE_RIGHT, doc.y).strokeColor('#ddd').stroke();
        doc.moveDown(1.5);

        // ---- Bill To ----
        doc.fontSize(11).font('Helvetica-Bold').text('Bill To');
        doc.fontSize(10).font('Helvetica')
            .text(order.address.name)
            .text(order.address.address)
            .text(`${order.address.landmark ? order.address.landmark + ', ' : ''}${order.address.pincode}`)
            .text(`Phone: ${order.address.mobile}`);
        doc.moveDown(1.5);

        // ---- Items table ----
        const tableTop = doc.y;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('Item', COL.item, tableTop);
        doc.text('Qty', COL.qty, tableTop, { width: COL_WIDTH.qty, align: 'right' });
        doc.text('Price', COL.price, tableTop, { width: COL_WIDTH.price, align: 'right' });
        doc.text('Total', COL.total, tableTop, { width: COL_WIDTH.total, align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(PAGE_RIGHT, tableTop + 15).strokeColor('#ddd').stroke();

        doc.font('Helvetica').fontSize(10);
        let rowY = tableTop + 22;
        order.items.forEach(item => {
            doc.text(item.fish.name, COL.item, rowY, { width: 240 });
            doc.text(`${item.quantity}kg`, COL.qty, rowY, { width: COL_WIDTH.qty, align: 'right' });
            doc.text(`Rs. ${item.price}`, COL.price, rowY, { width: COL_WIDTH.price, align: 'right' });
            doc.text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, COL.total, rowY, { width: COL_WIDTH.total, align: 'right' });
            rowY += 20;
        });

        doc.moveTo(50, rowY).lineTo(PAGE_RIGHT, rowY).strokeColor('#ddd').stroke();
        doc.y = rowY + 15;

        // ---- Summary (right-aligned block) ----
        const gst = order.totalAmount * 0.05;
        const subtotal = order.totalAmount - gst;
        const summaryLabelX = 300, summaryLabelWidth = 170, summaryValueX = 470, summaryWidth = 80;

        const summaryRow = (label, value, opts = {}) => {
            const y = doc.y;
            doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts.bold ? 10 : 10).fillColor(opts.color || '#000');
            doc.text(label, summaryLabelX, y, { width: summaryLabelWidth });
            doc.text(value, summaryValueX, y, { width: summaryWidth, align: 'right' });
            doc.moveDown(opts.bold ? 0.8 : 0.5);
        };

        summaryRow('Subtotal:', `Rs. ${subtotal.toFixed(2)}`);
        summaryRow('GST (5%):', `Rs. ${gst.toFixed(2)}`);
        doc.moveTo(summaryLabelX, doc.y).lineTo(PAGE_RIGHT, doc.y).strokeColor('#ddd').stroke();
        doc.moveDown(0.5);
        summaryRow('Grand Total:', `Rs. ${order.totalAmount}`, { bold: true });
        summaryRow('Amount Due (Cash/UPI at Delivery):', `Rs. ${order.balanceAmount}`, { bold: true, color: '#c0392b' });

        doc.fillColor('#000');
        doc.end();
    });
};
