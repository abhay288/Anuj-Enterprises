/**
 * Cloudinary Image Upload Service for Anuj Enterprises B2B Platform
 * Supports:
 * 1. Direct Unsigned Upload to Cloudinary CDN
 * 2. Backend Proxy Upload (/api/v1/upload/cloudinary)
 * 3. Instant Local Optimized Data-URI Fallback
 */

export const CLOUDINARY_CONFIG = {
  cloudName: localStorage.getItem('CLOUDINARY_CLOUD_NAME') || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'uazkw46b',
  uploadPreset: localStorage.getItem('CLOUDINARY_UPLOAD_PRESET') || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'anuj_fmcg_products',
  folder: 'anuj_enterprises/products'
};

export const setCloudinaryConfig = (cloudName, uploadPreset) => {
  if (cloudName) {
    localStorage.setItem('CLOUDINARY_CLOUD_NAME', cloudName.trim());
    CLOUDINARY_CONFIG.cloudName = cloudName.trim();
  }
  if (uploadPreset) {
    localStorage.setItem('CLOUDINARY_UPLOAD_PRESET', uploadPreset.trim());
    CLOUDINARY_CONFIG.uploadPreset = uploadPreset.trim();
  }
};

/**
 * Reads a File object as Base64 Data URL
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image file to Cloudinary
 * @param {File|Blob|string} imageSource - File object or Base64 string
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{ url: string, publicId?: string, source: string }>}
 */
export const uploadToCloudinary = async (imageSource, onProgress = () => {}) => {
  onProgress(15);

  let dataUrl = '';
  if (typeof imageSource === 'string') {
    dataUrl = imageSource;
  } else if (imageSource instanceof File || imageSource instanceof Blob) {
    dataUrl = await fileToDataUrl(imageSource);
  }

  onProgress(35);

  // 1. Try Backend Upload Endpoint
  try {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const response = await fetch(`${backendUrl}/upload/cloudinary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: dataUrl,
        folder: CLOUDINARY_CONFIG.folder
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        onProgress(100);
        return {
          url: data.url,
          publicId: data.public_id || '',
          source: 'cloudinary-backend'
        };
      }
    }
  } catch (err) {
    console.warn('Backend Cloudinary upload route skipped, trying direct client upload...', err);
  }

  onProgress(50);

  // 2. Try Direct Unsigned Upload to Cloudinary API
  const activeCloudName = CLOUDINARY_CONFIG.cloudName;
  const activePreset = CLOUDINARY_CONFIG.uploadPreset;

  if (activeCloudName && activePreset) {
    try {
      const formData = new FormData();
      if (imageSource instanceof File || imageSource instanceof Blob) {
        formData.append('file', imageSource);
      } else {
        formData.append('file', dataUrl);
      }
      formData.append('upload_preset', activePreset);
      formData.append('folder', CLOUDINARY_CONFIG.folder);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${activeCloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (cloudinaryRes.ok) {
        const result = await cloudinaryRes.json();
        if (result.secure_url) {
          onProgress(100);
          return {
            url: result.secure_url,
            publicId: result.public_id,
            source: 'cloudinary-direct'
          };
        }
      }
    } catch (directErr) {
      console.warn('Direct Cloudinary upload failed, falling back to optimized data URL', directErr);
    }
  }

  onProgress(100);
  // 3. Fail-safe fallback: Return the high-res data URL so image works immediately in UI
  return {
    url: dataUrl,
    publicId: `local-${Date.now()}`,
    source: 'data-url'
  };
};
