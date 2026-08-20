import { Request, Response, NextFunction } from 'express';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const validateImagePayload = (req: Request, res: Response, next: NextFunction) => {
  const { url, image, images } = req.body || {};
  const targetUrl = url || image;

  if (targetUrl) {
    const cleanUrl = String(targetUrl).toLowerCase();
    // Reject dangerous file extensions
    const forbiddenExts = ['.exe', '.php', '.js', '.sh', '.bat', '.cmd', '.py'];
    if (forbiddenExts.some(ext => cleanUrl.endsWith(ext))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image file type. Executable files are strictly forbidden.',
        code: 'FORBIDDEN_FILE_TYPE'
      });
    }
  }

  next();
};
