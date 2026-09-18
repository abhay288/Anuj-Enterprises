import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'USER' | 'SALESMAN' | 'ADMIN';
    salesmanId?: string;
    name?: string;
    status?: string;
  };
}

export const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'd696760c179af2e3b8929acc37c740640a3cbcd9d2b270d608fe859fb94dc6b0';
};

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const adminHeader = req.headers['x-admin-auth'] || req.headers['x-admin-key'];

  // 1. Direct Admin Master Bypass / Admin Session recognition
  if (adminHeader === 'true' || adminHeader === 'anuj_admin_master') {
    req.user = {
      id: 'ADMIN_ENTERPRISE',
      email: 'anujenterprises.fmcg.006@gmail.com',
      role: 'ADMIN',
      name: 'ANUJ ENTERPRISES'
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const secret = getJwtSecret();
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
  if (!req.user || !req.user.id) {
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
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this resource',
        code: 'UNAUTHORIZED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] role`,
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};
