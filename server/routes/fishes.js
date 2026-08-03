import express from 'express';
import { getFishes } from '../controllers/fishController.js';
const router = express.Router();
router.get('/', getFishes);
export default router;
