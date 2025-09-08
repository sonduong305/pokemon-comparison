export class ImageCropper {
    /**
     * Crops transparent/white pixels from an image URL and returns a cropped data URL
     * Also returns the crop bounds for proper alignment
     */
    static async cropImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Enable CORS for external images
            
            img.onload = function() {
                try {
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas size to image size
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw image
                    ctx.drawImage(img, 0, 0);
                    
                    // Get image data
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const pixels = imageData.data;
                    
                    // Find bounds (non-transparent pixels)
                    const bounds = ImageCropper.findContentBounds(pixels, canvas.width, canvas.height);
                    
                    if (!bounds) {
                        // If no content found, return original
                        resolve({
                            url: imageUrl,
                            originalHeight: img.height,
                            croppedHeight: img.height,
                            cropRatio: 1
                        });
                        return;
                    }
                    
                    // Create cropped canvas
                    const croppedCanvas = document.createElement('canvas');
                    const croppedCtx = croppedCanvas.getContext('2d');
                    
                    const cropWidth = bounds.right - bounds.left + 1;
                    const cropHeight = bounds.bottom - bounds.top + 1;
                    
                    croppedCanvas.width = cropWidth;
                    croppedCanvas.height = cropHeight;
                    
                    // Draw cropped image
                    croppedCtx.drawImage(
                        img,
                        bounds.left, bounds.top, cropWidth, cropHeight,
                        0, 0, cropWidth, cropHeight
                    );
                    
                    // Return cropped image as data URL with metadata
                    resolve({
                        url: croppedCanvas.toDataURL('image/png'),
                        originalHeight: img.height,
                        croppedHeight: cropHeight,
                        cropRatio: cropHeight / img.height,
                        bounds: bounds
                    });
                } catch (error) {
                    console.error('Error cropping image:', error);
                    // Return original on error
                    resolve({
                        url: imageUrl,
                        originalHeight: img.height,
                        croppedHeight: img.height,
                        cropRatio: 1
                    });
                }
            };
            
            img.onerror = function() {
                console.error('Failed to load image:', imageUrl);
                // Return original URL on error
                resolve({
                    url: imageUrl,
                    originalHeight: 100,
                    croppedHeight: 100,
                    cropRatio: 1
                });
            };
            
            img.src = imageUrl;
        });
    }
    
    /**
     * Find the bounds of non-transparent/non-white content in image
     */
    static findContentBounds(pixels, width, height) {
        let top = height;
        let bottom = 0;
        let left = width;
        let right = 0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = pixels[idx];
                const g = pixels[idx + 1];
                const b = pixels[idx + 2];
                const a = pixels[idx + 3];
                
                // Check if pixel is not transparent and not white
                // Consider a pixel as content if:
                // - Alpha > 10 (not fully transparent)
                // - Not pure white (allowing some tolerance)
                const isContent = a > 10 && !(r > 250 && g > 250 && b > 250);
                
                if (isContent) {
                    top = Math.min(top, y);
                    bottom = Math.max(bottom, y);
                    left = Math.min(left, x);
                    right = Math.max(right, x);
                }
            }
        }
        
        // Check if we found any content
        if (top > bottom || left > right) {
            return null;
        }
        
        // Add small padding (2 pixels) to avoid cutting too close
        const padding = 2;
        return {
            top: Math.max(0, top - padding),
            bottom: Math.min(height - 1, bottom + padding),
            left: Math.max(0, left - padding),
            right: Math.min(width - 1, right + padding)
        };
    }
    
    /**
     * Process multiple images and cache results
     */
    static async cropImages(imageUrls) {
        const cache = new Map();
        const results = new Map();
        
        for (const url of imageUrls) {
            if (cache.has(url)) {
                results.set(url, cache.get(url));
            } else {
                const cropped = await this.cropImage(url);
                cache.set(url, cropped);
                results.set(url, cropped);
            }
        }
        
        return results;
    }
}

export default ImageCropper;