import jwt from 'jsonwebtoken';

const authMiddleware = (roles=[]) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            const jwtSecret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, jwtSecret);
            req.user = decoded; 
            const userRole = req.user.role?.toLowerCase();
            const allowedRoles = roles.map(r => r.toLowerCase());
            
            if (roles.length && !allowedRoles.includes(userRole)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        } catch (error) {
            console.log("Error", error)
            res.status(401).json({ message: 'Token is not valid' });
        }
    };
}

export default authMiddleware;

