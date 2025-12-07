import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.log('No token provided for:', req.method, req.path);
        return res.status(401).json({ error: 'Not authorized' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Support both user tokens (userId/id) and admin tokens (adminId)
        req.user = { 
            id: decoded.userId || decoded.id || decoded.adminId, 
            isAdmin: decoded.isAdmin || false 
        };
        console.log('Authenticated user:', req.user);
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ error: 'Token invalid' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        console.log('Admin access granted for:', req.method, req.path);
        next();
    } else {
        console.log('Admin access denied. User:', req.user);
        res.status(403).json({ error: 'Admin access required' });
    }
};
