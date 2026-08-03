import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load env BEFORE importing routes so Prisma gets the DB URL
dotenv.config({ path: '../prisma/.env' }); 

import authRoutes from './routes/auth.js';
import fishRoutes from './routes/fishes.js';
import orderRoutes from './routes/orders.js';
import slotRoutes from './routes/slots.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/invoices', express.static('../invoices'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/fishes', fishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/slots', slotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🐟 Fish2Home Server running on port ${PORT}`));
