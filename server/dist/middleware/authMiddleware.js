import jwt from 'jsonwebtoken';
export const getJwtSecret = () => {
    return process.env.JWT_SECRET || 'd696760c179af2e3b8929acc37c740640a3cbcd9d2b270d608fe859fb94dc6b0';
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
        // If token is expired or invalid, do not block public routes.
        // Explicitly protected routes will be enforced by requireAuth.
        req.user = undefined;
        next();
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
