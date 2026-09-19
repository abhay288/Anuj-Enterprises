import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Customer } from '../models/Customer.js';
import { Salesman } from '../models/Salesman.js';
import { AdminActivity } from '../models/AdminActivity.js';
import { getJwtSecret } from '../middleware/authMiddleware.js';
import { sendAdminNewDeviceAlertEmail } from '../utils/emailService.js';
const parseUserAgent = (ua) => {
    let browser = 'Chrome (Standard)';
    let os = 'Windows PC';
    let deviceType = 'Desktop Computer';
    if (!ua)
        return { browser, os, deviceType };
    if (/mobile|android|iphone/i.test(ua)) {
        deviceType = /ipad|tablet/i.test(ua) ? 'Tablet' : 'Mobile Phone';
    }
    else if (/macintosh|mac os x/i.test(ua)) {
        deviceType = 'MacBook / Mac';
    }
    else if (/windows/i.test(ua)) {
        deviceType = 'Windows PC';
    }
    else if (/linux/i.test(ua)) {
        deviceType = 'Linux Desktop';
    }
    if (/windows nt 10/i.test(ua))
        os = 'Windows 10 / 11';
    else if (/windows nt/i.test(ua))
        os = 'Windows';
    else if (/mac os x ([0-9_]+)/i.test(ua))
        os = `macOS ${RegExp.$1.replace(/_/g, '.')}`;
    else if (/android ([0-9.]+)/i.test(ua))
        os = `Android ${RegExp.$1}`;
    else if (/iphone os ([0-9_]+)/i.test(ua))
        os = `iOS ${RegExp.$1.replace(/_/g, '.')}`;
    else if (/linux/i.test(ua))
        os = 'Linux';
    if (/edg\/([0-9.]+)/i.test(ua))
        browser = `Microsoft Edge ${RegExp.$1.split('.')[0]}`;
    else if (/chrome\/([0-9.]+)/i.test(ua) && !/edg/i.test(ua))
        browser = `Google Chrome ${RegExp.$1.split('.')[0]}`;
    else if (/firefox\/([0-9.]+)/i.test(ua))
        browser = `Mozilla Firefox ${RegExp.$1.split('.')[0]}`;
    else if (/safari\/([0-9.]+)/i.test(ua) && !/chrome/i.test(ua))
        browser = `Apple Safari ${RegExp.$1.split('.')[0]}`;
    return { browser, os, deviceType };
};
export const register = async (req, res) => {
    try {
        const { name, shopName, ownerName, mobile, phone, email, password, address, city, state } = req.body;
        const finalName = String(shopName || name || '').trim();
        const finalOwner = String(ownerName || name || '').trim();
        const cleanMobile = String(mobile || phone || '').trim();
        if (!finalName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required',
                code: 'MISSING_FIELDS'
            });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists',
                code: 'EMAIL_EXISTS'
            });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const customerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
        const userObj = await User.create({
            name: finalName,
            email: cleanEmail,
            phone: cleanMobile,
            passwordHash,
            role: 'CUSTOMER',
            status: 'Active'
        });
        let customerDoc = await Customer.findOne({ email: cleanEmail });
        if (!customerDoc) {
            customerDoc = await Customer.create({
                customerId,
                name: finalName,
                ownerName: finalOwner,
                mobile: cleanMobile,
                phone: cleanMobile,
                email: cleanEmail,
                address: address ? String(address).trim() : '',
                city: city ? String(city).trim() : 'Kanpur',
                state: state ? String(state).trim() : 'Uttar Pradesh',
                classification: 'NORMAL',
                customerMode: 'QUICK',
                createdBy: 'SELF_REGISTERED'
            });
        }
        const JWT_SECRET = getJwtSecret();
        const token = jwt.sign({
            id: String(userObj._id),
            email: userObj.email,
            role: 'customer',
            name: userObj.name,
            customerId: customerDoc.customerId,
            status: userObj.status
        }, JWT_SECRET, { expiresIn: '24h' });
        return res.status(201).json({
            success: true,
            message: 'Retailer account created successfully',
            data: {
                token,
                user: {
                    id: userObj._id,
                    name: customerDoc.name || userObj.name,
                    shopName: customerDoc.name || userObj.name,
                    ownerName: customerDoc.ownerName || userObj.name,
                    email: userObj.email,
                    role: 'customer',
                    customerId: customerDoc.customerId,
                    mobile: customerDoc.mobile || customerDoc.phone || userObj.phone,
                    address: customerDoc.address,
                    city: customerDoc.city,
                    state: customerDoc.state
                }
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export const login = async (req, res) => {
    try {
        const { identifier, password, role } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide identifier/email/mobile and password',
                code: 'MISSING_CREDENTIALS'
            });
        }
        const cleanId = String(identifier).trim();
        const cleanRole = role ? String(role).toLowerCase() : 'user';
        const JWT_SECRET = getJwtSecret();
        // 1. Check Salesman Account (Salesman ID or Email)
        if (cleanRole === 'salesman' || cleanId.toUpperCase().startsWith('AE-SM') || cleanId.toUpperCase().startsWith('SLS')) {
            const sId = cleanId.toUpperCase();
            const salesmanObj = await Salesman.findOne({
                $or: [{ salesmanId: sId }, { email: cleanId.toLowerCase() }]
            }).select('+passwordHash');
            if (salesmanObj) {
                if (salesmanObj.status === 'Disabled') {
                    return res.status(403).json({
                        success: false,
                        message: 'Your field sales account is deactivated. Please contact Administrator.',
                        code: 'ACCOUNT_DISABLED'
                    });
                }
                const isMatch = await bcrypt.compare(password, salesmanObj.passwordHash);
                if (isMatch) {
                    const token = jwt.sign({
                        id: String(salesmanObj._id),
                        salesmanId: salesmanObj.salesmanId,
                        email: salesmanObj.email,
                        role: 'SALESMAN',
                        name: salesmanObj.name,
                        status: salesmanObj.status
                    }, JWT_SECRET, { expiresIn: '24h' });
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
        // 2. Check Admin / Corporate User (by role or if email belongs to an Admin)
        let adminObj = null;
        if (cleanRole === 'admin' || cleanId.toLowerCase().includes('admin') || cleanId.toLowerCase() === 'anujenterprises.fmcg.006@gmail.com') {
            adminObj = await User.findOne({
                $or: [
                    { email: cleanId.toLowerCase() },
                    { role: 'ADMIN', email: cleanId.toLowerCase() }
                ]
            }).select('+passwordHash');
        }
        else if (cleanId.includes('@')) {
            const candidateUser = await User.findOne({ email: cleanId.toLowerCase() }).select('+passwordHash');
            if (candidateUser && candidateUser.role === 'ADMIN') {
                adminObj = candidateUser;
            }
        }
        if (adminObj && adminObj.role === 'ADMIN') {
            if (adminObj.status === 'Disabled') {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been deactivated. Please contact Administrator.',
                    code: 'ACCOUNT_DISABLED'
                });
            }
            const isMatch = await bcrypt.compare(password, adminObj.passwordHash);
            if (isMatch) {
                const token = jwt.sign({
                    id: String(adminObj._id),
                    email: adminObj.email,
                    role: adminObj.role,
                    name: adminObj.name,
                    status: adminObj.status
                }, JWT_SECRET, { expiresIn: '24h' });
                // Track Device Security for Admin accounts
                const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || '127.0.0.1';
                const uaString = req.headers['user-agent'] || '';
                const parsed = parseUserAgent(uaString);
                const rawDeviceId = req.headers['x-device-id'] || '';
                const deviceId = rawDeviceId || `${parsed.deviceType}_${parsed.os}_${parsed.browser}`.replace(/\s+/g, '_');
                const knownList = adminObj.knownDevices || [];
                const existingDevice = knownList.find(d => d.deviceId === deviceId || (d.browser === parsed.browser && d.os === parsed.os));
                const isNewDevice = !existingDevice;
                if (isNewDevice) {
                    adminObj.knownDevices = [
                        ...knownList,
                        {
                            deviceId,
                            browser: parsed.browser,
                            os: parsed.os,
                            deviceType: parsed.deviceType,
                            firstSeenAt: new Date(),
                            lastSeenAt: new Date(),
                            lastIP: clientIp,
                            lastLocation: 'Kanpur Region, Uttar Pradesh (Approximate)',
                            lastLoginAt: new Date()
                        }
                    ];
                    const now = new Date();
                    const loginDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                    const loginTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                    sendAdminNewDeviceAlertEmail({
                        adminEmail: adminObj.email,
                        adminName: adminObj.name,
                        loginDate,
                        loginTime,
                        timezone: 'IST (UTC+05:30)',
                        ipAddress: clientIp,
                        approximateLocation: 'Kanpur / Uttar Pradesh, India (Approximate)',
                        deviceType: parsed.deviceType,
                        os: parsed.os,
                        browser: parsed.browser,
                        userAgent: uaString,
                        deviceId
                    }).catch((emailErr) => {
                        console.warn('[AuthController] Non-blocking new device alert email failure caught:', emailErr?.message || emailErr);
                    });
                    AdminActivity.create({
                        action: 'ADMIN_NEW_DEVICE_LOGIN',
                        adminId: String(adminObj._id),
                        adminName: adminObj.name,
                        details: `Admin login from new device (${parsed.deviceType}, ${parsed.os}, ${parsed.browser}) at IP ${clientIp}`
                    }).catch(() => { });
                }
                else {
                    existingDevice.lastSeenAt = new Date();
                    existingDevice.lastIP = clientIp;
                    existingDevice.lastLoginAt = new Date();
                    adminObj.markModified('knownDevices');
                    AdminActivity.create({
                        action: 'ADMIN_LOGIN',
                        adminId: String(adminObj._id),
                        adminName: adminObj.name,
                        details: `Admin login from recognized device (${parsed.deviceType}) at IP ${clientIp}`
                    }).catch(() => { });
                }
                adminObj.lastLogin = new Date();
                await adminObj.save();
                const pwdChangedAt = adminObj.passwordChangedAt || adminObj.createdAt || new Date();
                const passwordAgeDays = Math.floor((Date.now() - new Date(pwdChangedAt).getTime()) / (1000 * 60 * 60 * 24));
                const isPasswordOld = passwordAgeDays >= 30;
                return res.json({
                    success: true,
                    data: {
                        token,
                        user: {
                            id: adminObj._id,
                            name: adminObj.name,
                            email: adminObj.email,
                            role: 'admin',
                            status: adminObj.status,
                            passwordChangedAt: pwdChangedAt,
                            passwordAgeDays,
                            isPasswordOld,
                            newDeviceDetected: isNewDevice
                        }
                    },
                    message: 'Admin Authentication Granted'
                });
            }
        }
        // 3. Customer / Retailer Account Lookup (by Email, Mobile/Phone, or Customer ID)
        const digitsOnly = cleanId.replace(/\D/g, '');
        let userObj = null;
        let customerDoc = null;
        if (cleanId.includes('@')) {
            userObj = await User.findOne({ email: cleanId.toLowerCase() }).select('+passwordHash');
            if (userObj) {
                customerDoc = await Customer.findOne({ email: userObj.email.toLowerCase() }).lean();
            }
        }
        else {
            // First check if there's a User with this phone number directly
            if (digitsOnly.length >= 10) {
                const matchingUsers = await User.find({
                    $or: [
                        { phone: cleanId },
                        { phone: digitsOnly.slice(-10) },
                        { phone: `+91${digitsOnly.slice(-10)}` },
                        { phone: `+91 ${digitsOnly.slice(-10)}` }
                    ]
                }).select('+passwordHash');
                for (const u of matchingUsers) {
                    const isMatch = await bcrypt.compare(password, u.passwordHash);
                    if (isMatch) {
                        userObj = u;
                        customerDoc = await Customer.findOne({ email: u.email }).lean();
                        break;
                    }
                }
            }
            // If not matched yet, search across Customer collection by phone, mobile, or customerId
            if (!userObj) {
                const potentialCustomers = await Customer.find({
                    $or: [
                        { phone: cleanId },
                        { mobile: cleanId },
                        ...(digitsOnly.length >= 10 ? [{ phone: digitsOnly.slice(-10) }, { mobile: digitsOnly.slice(-10) }] : []),
                        { customerId: cleanId.toUpperCase() }
                    ]
                }).lean();
                for (const c of potentialCustomers) {
                    if (c.email) {
                        const u = await User.findOne({ email: c.email.toLowerCase() }).select('+passwordHash');
                        if (u) {
                            const isMatch = await bcrypt.compare(password, u.passwordHash);
                            if (isMatch) {
                                userObj = u;
                                customerDoc = c;
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (userObj) {
            if (userObj.status === 'Disabled') {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is deactivated. Please contact support.',
                    code: 'ACCOUNT_DISABLED'
                });
            }
            const isMatch = await bcrypt.compare(password, userObj.passwordHash);
            if (isMatch) {
                const userRole = (userObj.role || 'customer').toLowerCase();
                const token = jwt.sign({
                    id: String(userObj._id),
                    email: userObj.email,
                    role: userRole,
                    name: userObj.name,
                    customerId: customerDoc?.customerId,
                    status: userObj.status
                }, JWT_SECRET, { expiresIn: '24h' });
                return res.json({
                    success: true,
                    data: {
                        token,
                        user: {
                            id: userObj._id,
                            name: customerDoc?.name || userObj.name,
                            shopName: customerDoc?.name || userObj.name,
                            ownerName: customerDoc?.ownerName || userObj.name,
                            shopOwnerName: customerDoc?.ownerName || userObj.name,
                            email: userObj.email,
                            mobile: customerDoc?.mobile || customerDoc?.phone || userObj.phone,
                            phone: customerDoc?.phone || customerDoc?.mobile || userObj.phone,
                            customerId: customerDoc?.customerId,
                            city: customerDoc?.city || 'Kanpur',
                            state: customerDoc?.state || 'Uttar Pradesh',
                            address: customerDoc?.address || '',
                            role: userRole === 'admin' ? 'admin' : 'customer',
                            status: userObj.status
                        }
                    },
                    message: `${userRole === 'admin' ? 'Admin' : 'Customer'} Login Successful`
                });
            }
        }
        // All authentication paths failed
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials. Check your identifier and password.',
            code: 'INVALID_CREDENTIALS'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Login error',
            code: 'AUTH_ERROR'
        });
    }
};
export const getMe = async (req, res) => {
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
export const logout = async (req, res) => {
    return res.json({
        success: true,
        message: 'Logged out successfully'
    });
};
export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required' });
    }
    try {
        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || getJwtSecret();
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const newToken = jwt.sign({ id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name }, getJwtSecret(), { expiresIn: '24h' });
        return res.json({ success: true, data: { token: newToken } });
    }
    catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
};
export const changePassword = async (req, res) => {
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
        let accountDoc = null;
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
        accountDoc.passwordChangedAt = new Date();
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to change password.',
            code: 'PASSWORD_CHANGE_ERROR'
        });
    }
};
