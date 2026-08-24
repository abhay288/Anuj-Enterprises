import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Salesman } from '../models/Salesman.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { AuthRequest, getJwtSecret } from '../middleware/authMiddleware.js';

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
    const JWT_SECRET = getJwtSecret();

    // 1. Check Admin / Corporate User
    if (cleanRole === 'admin' || cleanId.toLowerCase() === 'admin@anujenterprises.demo' || cleanId.includes('@')) {
      const userObj = await User.findOne({ email: cleanId.toLowerCase() }).select('+passwordHash');
      
      if (userObj) {
        // Enforce Account Status Check (Requirement 6)
        if (userObj.status === 'Disabled') {
          return res.status(403).json({
            success: false,
            message: 'Your account has been deactivated. Please contact Administrator.',
            code: 'ACCOUNT_DISABLED'
          });
        }

        const isMatch = await bcrypt.compare(password, userObj.passwordHash);
        if (isMatch) {
          const token = jwt.sign(
            { 
              id: String(userObj._id), 
              email: userObj.email, 
              role: userObj.role, 
              name: userObj.name,
              status: userObj.status
            },
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
                role: userObj.role.toLowerCase(),
                status: userObj.status
              }
            },
            message: `${userObj.role} Authentication Granted`
          });
        }
      }
    }

    // 2. Check Salesman Account (Salesman ID or Email)
    if (cleanRole === 'salesman' || cleanId.toUpperCase().startsWith('AE-SM') || cleanId.toUpperCase().startsWith('SLS')) {
      const sId = cleanId.toUpperCase();
      const salesmanObj = await Salesman.findOne({ 
        $or: [{ salesmanId: sId }, { email: cleanId.toLowerCase() }] 
      }).select('+passwordHash');

      if (salesmanObj) {
        // Enforce Account Status Check (Requirement 6)
        if (salesmanObj.status === 'Disabled') {
          return res.status(403).json({
            success: false,
            message: 'Your field sales account is deactivated. Please contact Administrator.',
            code: 'ACCOUNT_DISABLED'
          });
        }

        const isMatch = await bcrypt.compare(password, salesmanObj.passwordHash);
        if (isMatch) {
          const token = jwt.sign(
            { 
              id: String(salesmanObj._id), 
              salesmanId: salesmanObj.salesmanId, 
              email: salesmanObj.email, 
              role: 'SALESMAN', 
              name: salesmanObj.name,
              status: salesmanObj.status
            },
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
                region: salesmanObj.region,
                status: salesmanObj.status
              }
            },
            message: 'Salesman Session Activated'
          });
        }
      }
    }

    // 3. Fallback check for Customer / General Account
    const customerObj = await User.findOne({ email: cleanId.toLowerCase() }).select('+passwordHash');
    if (customerObj) {
      if (customerObj.status === 'Disabled') {
        return res.status(403).json({
          success: false,
          message: 'Your account is deactivated.',
          code: 'ACCOUNT_DISABLED'
        });
      }

      const isMatch = await bcrypt.compare(password, customerObj.passwordHash);
      if (isMatch) {
        const token = jwt.sign(
          { 
            id: String(customerObj._id), 
            email: customerObj.email, 
            role: customerObj.role, 
            name: customerObj.name,
            status: customerObj.status
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          success: true,
          data: {
            token,
            user: {
              id: customerObj._id,
              name: customerObj.name,
              email: customerObj.email,
              role: 'customer',
              status: customerObj.status
            }
          },
          message: 'Customer Login Successful'
        });
      }
    }

    // All authentication paths failed
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Check your identifier and password.',
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
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || getJwtSecret();
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name },
      getJwtSecret(),
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

    if (!accountDoc) {
      return res.status(404).json({
        success: false,
        message: 'Account not found in database.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verify Old Password against DB
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

    // Trace Activity
    await AdminActivity.create({
      action: isSalesmanAccount ? 'SALESMAN_PASSWORD_CHANGED' : 'ADMIN_PASSWORD_CHANGED',
      adminId: String(accountDoc._id),
      adminName: accountDoc.name || (isSalesmanAccount ? `Salesman ${accountDoc.salesmanId}` : 'Admin'),
      details: `Password changed for ${isSalesmanAccount ? 'Salesman ' + (accountDoc.salesmanId || accountDoc.name) : 'Admin ' + accountDoc.email}.`
    });

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
