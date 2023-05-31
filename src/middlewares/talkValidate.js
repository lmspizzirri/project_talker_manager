const talkValidation = (req, res, next) => {
    const { talk } = req.body;
    const regex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/; 
    if (!talk) {
        return res.status(400).json({
            "message": "O campo \"talk\" é obrigatório"
        })
    }
    if (!talk.hasOwnProperty("watchedAt")) {
        
        return res.status(400).json({
            "message": "O campo \"watchedAt\" é obrigatório"
        })
    }

    if(!regex.test(talk.watchedAt)) {
        return res.status(400).json({
            "message": "O campo \"watchedAt\" deve ter o formato \"dd/mm/aaaa\""
        })
    }

    if (!talk.hasOwnProperty("rate")) {
        return res.status(400).json({
            "message": "O campo \"rate\" é obrigatório"
        })
    }

    if(talk.rate < 1 || talk.rate > 5 || !Number.isInteger(talk.rate)) {
        return res.status(400).json({
            "message": "O campo \"rate\" deve ser um número inteiro entre 1 e 5"
        })
    }
    next();
}

module.exports = { talkValidation }