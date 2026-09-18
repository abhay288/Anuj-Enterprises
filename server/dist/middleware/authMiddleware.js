import jwt from 'jsonwebtoken';
export const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL: JWT_SECRET environment variable is missing in production configuration.');
        }
        return 'anuj_enterprises_dev_jwt_secret_key_2026';
    }
    return secret;
};
export const authenticateJWT = (req, res, next) => {
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
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired access token',
            code: 'UNAUTHORIZED'
        });
    }
};
export const requireAuth = (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required to access this resource',
            code: 'UNAUTHORIZED'
        });
    }
    next();
};
export const requireRoles = (...roles) => {
    return (req, res, next) => {
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
