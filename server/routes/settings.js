import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/auth.js';
import { uploadLogo } from '../middleware/upload.js';

const router = express.Router();

// Public — every page needs this to render the current logo/site name.
router.get('/', getSettings);

// Admin only — update site name and/or upload a new logo.
router.put('/', protect, admin, uploadLogo.single('logo'), updateSettings);

export default router;
