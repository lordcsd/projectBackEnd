const { validationResult } = require("express-validator");


function validateParams(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const _errors = errors.array().map(e => e.msg)
        return res.status(422).json({ statusCode: 422, errors: _errors });
    }
    next();
}

module.exports = { validateParams }