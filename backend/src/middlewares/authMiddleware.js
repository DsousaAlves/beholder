const jwt = require('jsonwebtoken');
const {isBlackListed} = require('../controllers/authController');

module.exports = (req, res, next) => {

    const token = req.headers['authorization'];

    if (token && !isBlackListed(token)) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded) {
                res.locals.token = decoded;
                return next();
            }
        } catch (error) {
            console.log('authMiddleware::verify_token:: invalid token');
        }
    }

    res.sendStatus(401);
}