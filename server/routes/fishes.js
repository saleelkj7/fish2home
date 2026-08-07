import express from 'express';
import { getFishes, getCategories, createFish, updateFish, deleteFish } from '../controllers/fishController.js';
import { protect, admin } from '../middleware/auth.js';
import { uploadFishImage } from '../middleware/upload.js';

const router = express.Router();

// Public
router.get('/', getFishes);
router.get('/categories', getCategories);

// Admin
router.post('/', protect, admin, uploadFishImage.single('image'), createFish);
router.put('/:id', protect, admin, uploadFishImage.single('image'), updateFish);
router.delete('/:id', protect, admin, deleteFish);

export default router;
