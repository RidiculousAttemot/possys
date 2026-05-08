const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'novapos-dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

const extractBearerToken = (authorizationHeader) => {
    if (!authorizationHeader || typeof authorizationHeader !== 'string') {
        return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
        return null;
    }

    return token.trim();
};

const signAuthToken = (user) => {
    if (!user) {
        throw new Error('Cannot sign auth token without user data');
    }

    return jwt.sign(
        {
            user_id: user.user_id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

const verifyAuthToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    extractBearerToken,
    signAuthToken,
    verifyAuthToken
};