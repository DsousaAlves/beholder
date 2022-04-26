const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function doLogin(req, res, next) {
    const {email, password} = req.body;

    if (email === 'davidsousaalves@gmail.com' &&
        bcrypt.compareSync(password, '$2a$12$pRJNLtnJMufrWa01oeYE5uirutvE4ayOCuMXoNnKuu5bl0VlulTTm')) {
        const token = jwt.sign({id: 1}, process.env.JWT_SECRET, {
            expiresIn: parseInt(process.env.JWT_EXPIRES)
        })
        res.json({ token });
    } else {
        res.sendStatus(401);
    }
}

function doLogout(req, res, next) {
    res.sendStatus(200);
}

module.exports = {
    doLogin, doLogout
}