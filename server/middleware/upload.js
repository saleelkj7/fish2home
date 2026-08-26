import multer from 'multer';

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Only JPG images are allowed'), false);
    }
};

// Uses memory storage (buffer, not disk) so the image can be uploaded
// straight to Cloudinary. Render's free tier wipes its own disk on every
// redeploy, so anything saved locally there would be lost.
export const uploadFishImage = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
