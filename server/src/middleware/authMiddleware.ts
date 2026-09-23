import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'USER' | 'CUSTOMER' | 'SALESMAN' | 'ADMIN';
    salesmanId?: string;
    customerId?: string;
    mobile?: string;
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
    if (decoded && decoded.role) {
      decoded.role = String(decoded.role).toUpperCase();
    }
    req.user = decoded;
    next();
  } catch (err) {
    // If token is expired or invalid, do not block public routes.
    // Explicitly protected routes will be enforced by requireAuth.
    req.user = undefined;
    next();
  }
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to access this resource',
      code: 'UNAUTHORIZED'
    });
  }

  // Admin Master / Enterprise Admin bypass
  const cleanRole = String(req.user.role || '').toUpperCase();
  if (cleanRole === 'ADMIN' || req.user.id === 'ADMIN_ENTERPRISE') {
    return next();
  }

  try {
    const { User } = await import('../models/User.js');
    const { Salesman } = await import('../models/Salesman.js');

    if (cleanRole === 'SALESMAN') {
      const isObjectId = req.user.id && req.user.id.match(/^[0-9a-fA-F]{24}$/);
      const salesmanDoc = await Salesman.findOne({
        $or: [
          ...(req.user.salesmanId ? [{ salesmanId: req.user.salesmanId }] : []),
          ...(isObjectId ? [{ _id: req.user.id }] : []),
          ...(req.user.email ? [{ email: req.user.email.toLowerCase() }] : [])
        ]
      }).select('status');

      if (!salesmanDoc) {
        return res.status(401).json({
          success: false,
          message: 'Your salesman account has been deleted by Administrator. Session terminated.',
          code: 'ACCOUNT_DELETED'
        });
      }

      if (salesmanDoc.status === 'Disabled') {
        return res.status(403).json({
          success: false,
          message: 'Your field sales account is deactivated. Please contact Administrator.',
          code: 'ACCOUNT_DISABLED'
        });
      }
    } else if (cleanRole === 'CUSTOMER' || cleanRole === 'USER') {
      const isObjectId = req.user.id && req.user.id.match(/^[0-9a-fA-F]{24}$/);
      const userDoc = await User.findOne({
        $or: [
          ...(isObjectId ? [{ _id: req.user.id }] : []),
          ...(req.user.email ? [{ email: req.user.email.toLowerCase() }] : [])
        ]
      }).select('status');

      if (!userDoc) {
        return res.status(401).json({
          success: false,
          message: 'Your customer account has been deleted by Administrator. Session terminated.',
          code: 'ACCOUNT_DELETED'
        });
      }

      if (userDoc.status === 'Disabled') {
        return res.status(403).json({
          success: false,
          message: 'Your customer account is deactivated. Please contact Administrator.',
          code: 'ACCOUNT_DISABLED'
        });
      }
    }
  } catch (err) {
    // Fail-open on unexpected DB connectivity error to prevent service disruptions
  }

  next();
};

export const requireRoles = (...roles: Array<'USER' | 'CUSTOMER' | 'SALESMAN' | 'ADMIN'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this resource',
        code: 'UNAUTHORIZED'
      });
    }

    const userRole = String(req.user.role).toUpperCase();
    const uppercaseRoles = roles.map(r => String(r).toUpperCase());

    if (!uppercaseRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] role`,
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};
