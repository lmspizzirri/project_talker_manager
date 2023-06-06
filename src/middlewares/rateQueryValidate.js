const rateQueryValidation = (req, res, next) => {
    const { rate } = req.query;
    if (!rate) { return next(); }
    const rateNumber = Number(rate);
    if (rateNumber < 1 || rateNumber > 5 || !Number.isInteger(rateNumber)) {
        return res.status(400).json({
            message: 'O campo \"rate\" deve ser um número inteiro entre 1 e 5',
        });
    }
    return next();
};

module.exports = { rateQueryValidation };
