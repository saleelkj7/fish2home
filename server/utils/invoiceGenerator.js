import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');
const DEVANAGARI_FONT_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'NotoSansDevanagari-Regular.ttf');

// Standard PDF fonts (Helvetica etc.) only cover Latin script — any Hindi
// or Marathi text a customer types into their address silently disappears
// otherwise. Detect Devanagari characters and switch fonts automatically.
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
// A single line can mix scripts (e.g. a Marathi landmark name followed by
// an English word like "station") — one font can't render both, so split
// into consecutive same-script runs and render each with the matching
// font, continuing on the same line via pdfkit's `continued` option.
const renderMixedLine = (doc, text, x) => {
    const segments = (text || '').match(/[\u0900-\u097F]+|[^\u0900-\u097F]+/g) || [text || ''];
    segments.forEach((seg, i) => {
        doc.font(DEVANAGARI_REGEX.test(seg) ? 'NotoDevanagari' : 'Helvetica');
        if (i === 0) {
            doc.text(seg, x, doc.y, { continued: segments.length > 1 });
        } else {
            doc.text(seg, { continued: i < segments.length - 1 });
        }
    });
};

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
        doc.registerFont('NotoDevanagari', DEVANAGARI_FONT_PATH);

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

        // Logo is drawn at y=45 with width 130 (~106pt tall at this
        // logo's aspect ratio), so the divider line needs to clear well
        // past that before it can be drawn without cutting through it.
        doc.y = 175;
        doc.moveTo(50, doc.y).lineTo(PAGE_RIGHT, doc.y).strokeColor('#ddd').stroke();
        doc.moveDown(2.5); // blank line of breathing room before Bill To

        // ---- Bill To ----
        const INDENT = 64; // a bit in from the page edge, not flush left
        doc.fontSize(11).font('Helvetica-Bold').text('Bill To', INDENT);
        doc.fontSize(10);
        renderMixedLine(doc, order.address.name, INDENT);
        renderMixedLine(doc, order.address.address, INDENT);
        const landmarkLine = `${order.address.landmark ? order.address.landmark + ', ' : ''}${order.address.pincode}`;
        renderMixedLine(doc, landmarkLine, INDENT);
        doc.font('Helvetica').text(`Phone: ${order.address.mobile}`, INDENT);

        if (order.deliverySlot) {
            const slotDate = new Date(order.deliverySlot.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text('Delivery Date & Slot', INDENT);
            doc.font('Helvetica').text(`${slotDate}, ${order.deliverySlot.startTime}:00 - ${order.deliverySlot.endTime}:00`, INDENT);
        }
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
        // order.totalAmount already includes GST (it was calculated at order
        // time as subtotal + 5%), so back out the original split correctly
        // instead of applying another 5% on top of an already-tax-inclusive
        // total, which would silently overstate both GST and understate subtotal.
        const subtotal = order.totalAmount / 1.05;
        const gst = order.totalAmount - subtotal;
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
        if (order.discountAmount > 0) {
            summaryRow(`Coupon Discount:`, `- Rs. ${order.discountAmount.toFixed(2)}`, { color: '#16a34a' });
        }
        doc.moveTo(summaryLabelX, doc.y).lineTo(PAGE_RIGHT, doc.y).strokeColor('#ddd').stroke();
        doc.moveDown(0.5);
        summaryRow('Grand Total:', `Rs. ${order.totalAmount}`, { bold: true });
        summaryRow('Amount Due (Cash/UPI at Delivery):', `Rs. ${order.balanceAmount}`, { bold: true, color: '#c0392b' });

        doc.fillColor('#000');
        doc.end();
    });
};
