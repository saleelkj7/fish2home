import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env BEFORE importing routes so Prisma gets the DB URL.
// Resolved relative to this file, so it works regardless of the
// directory the process was launched from (important on Render).
dotenv.config({ path: path.join(__dirname, '..', 'prisma', '.env') });
// On platforms like Render, real env vars are injected directly and this
// dotenv call will simply find nothing to load — that's expected.

import authRoutes from './routes/auth.js';
import fishRoutes from './routes/fishes.js';
import orderRoutes from './routes/orders.js';
import slotRoutes from './routes/slots.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

// Comma-separated list of allowed frontend origins, e.g.
// "https://fishtokri.co.in,https://www.fishtokri.co.in,http://localhost:5173"
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // allow non-browser requests (curl, server-to-server) with no origin
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));
app.use(express.json());
app.use('/invoices', express.static(path.join(__dirname, '..', 'invoices')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/fishes', fishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/slots', slotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🐟 Fish2Home Server running on port ${PORT}`));
