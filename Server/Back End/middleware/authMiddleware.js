// server/Back End/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

const auth = async (req, res, next) => {
    let token;

    // The token is sent in the headers like this: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get token from the header (remove "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find the user by the ID that was in the token
            // We attach the user to the request object, but exclude the password
            req.user = await User.findById(decoded.user.id).select('-password');

            // 4. Move on to the next function (the actual route)
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { auth };