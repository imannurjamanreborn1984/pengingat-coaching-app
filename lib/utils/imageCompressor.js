/**
 * Compress and resize an image File object to JPEG Data URL
 * @param {File} file - The uploaded File object
 * @param {number} maxWidth - Max width in pixels (default 800)
 * @param {number} maxHeight - Max height in pixels (default 800)
 * @param {number} quality - JPEG compression quality 0.1 - 1.0 (default 0.7)
 * @returns {Promise<string>} Base64 Data URL of compressed JPEG image
 */
export const compressImageFile = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File bukan gambar yang valid'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Fill background with white (for transparent PNG conversion to JPEG)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with 70% quality (~50-100KB output size)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};
