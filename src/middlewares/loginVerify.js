const isEmailValid = require('../service/validEmail');

const emailVerify = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message: 'O campo "email" é obrigatório',
    });
  }
  const checkEmail = isEmailValid(email);
  if (checkEmail === false) {
      return res.status(400).json({
        message: 'O "email" deve ter o formato "email@email.com"',
      });
    }
    return next();
};

const passwordVerify = (req, res, next) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        message: 'O campo "password" é obrigatório',
      });
    }
    if (password.length >= 6 === false) {
      return res.status(400).json({
        message: 'O "password" deve ter pelo menos 6 caracteres',
    });
    }
    return next();
};

module.exports = { emailVerify, passwordVerify };
