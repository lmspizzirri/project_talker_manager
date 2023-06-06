const dateQueryValidation = (req, res, next) => {
    const { date } = req.query;
    const regex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/; 

    if(!date) { return next()};
    if(!regex.test(date)) {
        return res.status(400).json({
            "message": "O parâmetro \"date\" deve ter o formato \"dd/mm/aaaa\""
        })
    }

    return next();
}

module.exports = { dateQueryValidation }

