import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'USER' | 'SALESMAN' | 'ADMIN';
    salesmanId?: string;
    name?: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Optional auth fallback for public catalogue read
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'anuj_enterprises_jwt_super_secret_key_2026_prod';
    const decoded = jwt.verify(token, secret) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
      code: 'UNAUTHORIZED'
    });
  }
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to access this resource',
      code: 'UNAUTHORIZED'
    });
  }
  next();
};

export const requireRoles = (...roles: Array<'USER' | 'SALESMAN' | 'ADMIN'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${roles.join(', ')}] role`,
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};
