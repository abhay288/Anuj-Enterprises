import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Salesman } from '../models/Salesman.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'anuj_enterprises_jwt_super_secret_key_2026_prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'anuj_enterprises_refresh_super_secret_key_2026';

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide identifier/email and password',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const cleanId = String(identifier).trim();
    const cleanRole = role ? String(role).toLowerCase() : 'user';

    // 1. Check Admin / User
    if (cleanRole === 'admin' || cleanId.toLowerCase() === 'admin@anujenterprises.demo') {
      const userObj = await User.findOne({ email: cleanId.toLowerCase() }).select('+passwordHash');
      if (userObj) {
        const isMatch = await bcrypt.compare(password, userObj.passwordHash);
        if (isMatch) {
          const token = jwt.sign(
            { id: userObj._id, email: userObj.email, role: userObj.role, name: userObj.name },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          userObj.lastLogin = new Date();
          await userObj.save();

          return res.json({
            success: true,
            data: {
              token,
              user: {
                id: userObj._id,
                name: userObj.name,
                email: userObj.email,
                role: 'admin',
                status: userObj.status
              }
            },
            message: 'Admin Authentication Granted'
          });
        }
      }

      // Hardcoded fallback for seed/demo if DB user not initialized
      if (cleanId === 'admin@anujenterprises.demo' && password === 'Admin@123') {
        const token = jwt.sign(
          { id: 'admin-1', email: cleanId, role: 'ADMIN', name: 'Anuj Sharma (Managing Director)' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          data: {
            token,
            user: {
              id: 'admin-1',
              name: 'Anuj Sharma (Managing Director)',
              email: cleanId,
              role: 'admin'
            }
          },
          message: 'Admin Session Activated'
        });
      }
    }

    // 2. Check Salesman
    if (cleanRole === 'salesman' || cleanId.toUpperCase().startsWith('AE-SM') || cleanId.toUpperCase().startsWith('SLS')) {
      const sId = cleanId.toUpperCase();
      const salesmanObj = await Salesman.findOne({ salesmanId: sId }).select('+passwordHash');

      if (salesmanObj) {
        const isMatch = await bcrypt.compare(password, salesmanObj.passwordHash);
        if (isMatch) {
          const token = jwt.sign(
            { id: salesmanObj._id, salesmanId: salesmanObj.salesmanId, email: salesmanObj.email, role: 'SALESMAN', name: salesmanObj.name },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          return res.json({
            success: true,
            data: {
              token,
              user: {
                id: salesmanObj._id,
                salesmanId: salesmanObj.salesmanId,
                name: salesmanObj.name,
                email: salesmanObj.email,
                phone: salesmanObj.phone,
                role: 'salesman',
                region: salesmanObj.region
              }
            },
            message: 'Salesman Session Activated'
          });
        }
      }

      // Demo fallback for Salesman
      if ((sId === 'AE-SM-001' || sId === 'SLS-101') && password === 'Sales@123') {
        const token = jwt.sign(
          { id: 'salesman-1', salesmanId: 'AE-SM-001', email: 'sales@anujenterprises.demo', role: 'SALESMAN', name: 'Rajesh Kumar' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          data: {
            token,
            user: {
              id: 'salesman-1',
              salesmanId: 'AE-SM-001',
              name: 'Rajesh Kumar',
              email: 'sales@anujenterprises.demo',
              phone: '+91 98765 43210',
              role: 'salesman',
              region: 'South India (Bengaluru Hub)'
            }
          },
          message: 'Salesman Session Activated'
        });
      }
    }

    // 3. Check Customer Account
    const userObj = await User.findOne({ email: cleanId.toLowerCase() }).select('+passwordHash');
    if (userObj) {
      const isMatch = await bcrypt.compare(password, userObj.passwordHash);
      if (isMatch) {
        const token = jwt.sign(
          { id: userObj._id, email: userObj.email, role: userObj.role, name: userObj.name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          data: {
            token,
            user: {
              id: userObj._id,
              name: userObj.name,
              email: userObj.email,
              role: 'customer'
            }
          },
          message: 'Customer Login Successful'
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Check Salesman ID or Admin email.',
      code: 'INVALID_CREDENTIALS'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Login error',
      code: 'AUTH_ERROR'
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
      code: 'UNAUTHORIZED'
    });
  }
  return res.json({
    success: true,
    data: { user: req.user }
  });
};

export const logout = async (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token required' });
  }
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({ success: true, data: { token: newToken } });
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body || {};

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Old Password, New Password, and Retype New Password.',
        code: 'MISSING_FIELDS'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and Retype New password do not match. Please verify and try again.',
        code: 'PASSWORD_MISMATCH'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters in length.',
        code: 'WEAK_PASSWORD'
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current old password.',
        code: 'IDENTICAL_PASSWORD'
      });
    }

    // Locate the current user in database (check User or Salesman)
    const userEmail = req.user?.email ? req.user.email.toLowerCase() : null;
    const userId = req.user?.id;
    const salesmanId = req.user?.salesmanId ? String(req.user.salesmanId).toUpperCase() : null;
    const isObjectId = userId && userId.match(/^[0-9a-fA-F]{24}$/);

    let accountDoc: any = null;
    let isSalesmanAccount = false;

    if (req.user?.role === 'SALESMAN' || salesmanId) {
      accountDoc = await Salesman.findOne({
        $or: [
          { salesmanId: salesmanId },
          { email: userEmail },
          { _id: isObjectId ? userId : null }
        ]
      }).select('+passwordHash');
      isSalesmanAccount = true;
    }

    if (!accountDoc) {
      accountDoc = await User.findOne({
        $or: [
          { email: userEmail },
          { _id: isObjectId ? userId : null }
        ]
      }).select('+passwordHash');
    }

    // If still not found, check Salesman collection as fallback
    if (!accountDoc) {
      accountDoc = await Salesman.findOne({
        $or: [
          { salesmanId: salesmanId },
          { email: userEmail },
          { _id: isObjectId ? userId : null }
        ]
      }).select('+passwordHash');
      if (accountDoc) isSalesmanAccount = true;
    }

    if (!accountDoc) {
      return res.status(404).json({
        success: false,
        message: 'Account not found in database.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify Old Password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, accountDoc.passwordHash);
    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect old password. Please enter your valid current password.',
        code: 'INCORRECT_OLD_PASSWORD'
      });
    }

    // Hash New Password with bcrypt (10 rounds)
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    accountDoc.passwordHash = newPasswordHash;
    await accountDoc.save();

    // Trace Admin Activity
    await AdminActivity.create({
      action: isSalesmanAccount ? 'SALESMAN_PASSWORD_CHANGED' : 'ADMIN_PASSWORD_CHANGED',
      adminId: String(accountDoc._id),
      adminName: accountDoc.name || (isSalesmanAccount ? `Salesman ${accountDoc.salesmanId}` : 'Admin'),
      details: `Password changed for ${isSalesmanAccount ? 'Salesman ' + (accountDoc.salesmanId || accountDoc.name) : 'Admin ' + accountDoc.email}.`
    });

    // Simulate / Trigger Notification to Registered Email
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log('================================================================');
    console.log(`📧 [SECURITY NOTIFICATION DISPATCHED TO ${isSalesmanAccount ? 'SALESMAN' : 'ADMIN'} EMAIL]`);
    console.log(`To:          ${accountDoc.email || 'anujenterprises.fmcg.006@gmail.com'}`);
    console.log(`Subject:     Security Alert: Password Updated for ${accountDoc.name || 'Account'}`);
    console.log(`Timestamp:   ${timestamp} IST`);
    console.log(`Role:        ${isSalesmanAccount ? 'SALES FORCE' : 'ADMINISTRATOR'}`);
    console.log('================================================================');

    return res.json({
      success: true,
      message: `Password changed successfully! Your new password is now active in the database.`,
      data: {
        id: accountDoc.salesmanId || accountDoc._id,
        email: accountDoc.email,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to change password.',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
};
