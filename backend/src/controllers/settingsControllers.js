function getSettings(req, res, next) {
    res.json({
        email: "davidsousaalves@gmail.com"
    });
}

module.exports = {
    getSettings
}