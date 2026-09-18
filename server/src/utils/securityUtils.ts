/**
 * Security & Sanitization Utilities for Anuj Enterprises Platform
 */

/**
 * Escapes regex control characters to prevent Regular Expression Denial of Service (ReDoS)
 * and unintended regex pattern injection.
 */
export const escapeRegex = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitizes CSV formula injection characters (=, +, -, @, \t, \r)
 * to prevent Remote Code Execution or dynamic execution in Excel / Google Sheets
 */
export const sanitizeCsvFormula = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
};

/**
 * Parses and bounds pagination parameters to prevent unbounded database queries.
 * @param query Express req.query object
 * @param defaultLimit Default limit if unspecified (default: 50)
 * @param maxLimit Maximum allowable page size (default: 100)
 */
export const parsePagination = (
  query: any,
  defaultLimit = 50,
  maxLimit = 100
): { page: number; limit: number; skip: number } => {
  const pageRaw = parseInt(query?.page, 10);
  const limitRaw = parseInt(query?.limit, 10);

  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  let limit = isNaN(limitRaw) || limitRaw < 1 ? defaultLimit : limitRaw;

  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Validates Base64 Image Payload format and size
 */
export const validateImagePayload = (
  image: string,
  maxSizeInBytes = 6 * 1024 * 1024 // 6MB
): { isValid: boolean; error?: string; mimeType?: string } => {
  if (!image || typeof image !== 'string') {
    return { isValid: false, error: 'Image data is required' };
  }

  // Check if HTTPS URL
  if (image.startsWith('https://') || image.startsWith('http://')) {
    return { isValid: true, mimeType: 'url' };
  }

  // Check Data URL Header
  const match = image.match(/^data:(image\/(jpeg|jpg|png|webp|svg\+xml));base64,/i);
  if (!match) {
    return { 
      isValid: false, 
      error: 'Invalid image format. Only JPEG, PNG, WEBP, and SVG formats are permitted.' 
    };
  }

  const mimeType = match[1].toLowerCase();

  // Approximate byte length of base64
  const base64Data = image.split(',')[1];
  if (!base64Data) {
    return { isValid: false, error: 'Corrupt image payload' };
  }

  const byteLength = (base64Data.length * 3) / 4;
  if (byteLength > maxSizeInBytes) {
    return { 
      isValid: false, 
      error: `Image size exceeds the maximum limit of ${maxSizeInBytes / (1024 * 1024)}MB` 
    };
  }

  return { isValid: true, mimeType };
};
