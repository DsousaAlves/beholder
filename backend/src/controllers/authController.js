function doLogin(req, res, next) {
    const {email, password} = req.body;

    if (email === 'davidsousaalves@gmail.com' && password === '123456') {
        res.sendStatus(200);
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