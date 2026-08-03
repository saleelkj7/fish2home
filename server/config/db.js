import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '../prisma/.env' });

const prisma = new PrismaClient();
export default prisma;
