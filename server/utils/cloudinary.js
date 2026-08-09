// Uploads an image buffer to Cloudinary and returns its permanent URL.
// Uses Cloudinary's unsigned upload API directly via fetch — no extra
// npm dependency needed, and it's a normal HTTPS call so it isn't
// affected by any outbound port restrictions.
export const uploadImageToCloudinary = async (fileBuffer, mimeType) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary is not configured (missing CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET)');
    }

    const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'fishtokri/fish');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Cloudinary upload failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    return data.secure_url;
};
