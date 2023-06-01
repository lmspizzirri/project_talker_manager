const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { PassThrough } = require('stream');
const { ageValidation } = require('./middlewares/ageValidate');
const { tokenValidation } = require('./middlewares/authValidate');
const { nameValidation } = require('./middlewares/nameValidate');
const { talkValidation } = require('./middlewares/talkValidate');
const importData = require('./service/importData');

const app = express();
app.use(express.json());

const path_file = '/talker.json'
const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';
var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

function isEmailValid(email) {
    if (!email)
        return false;
    var valid = emailRegex.test(email);
    if(!valid)
        return false;
    return true;
}

function tokenGenerator(){
  let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let counter = 0;
    while (counter < 16) {
      result += characters.charAt(Math.floor(Math.random() * 16));
      counter += 1;
    }
  return result;
}

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_req, res) => {
  const talkers = await importData();
  return res.status(200).json( talkers );
});

app.get('/talker/search',
tokenValidation, async (req, res) => {
  const { q } = req.query;
  const talkers = await importData();
  const searchedTalker = talkers.filter((talker) => talker.name.includes(q));
  if(!q) { return res.status(200).json(talkers) }
  if(!searchedTalker) { return res.status(200).json([])}
  return res.status(200).json(searchedTalker);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkers = await importData();
  const findId = talkers.filter((talker) => talker.id === Number(id));
  if( findId.length > 0 ){
    return res.status(200).json( findId[0] );
  } else {
    return res.status(404).json( {
      "message": "Pessoa palestrante não encontrada"
    });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let emailLength = 0;
  let passwordLength = 0;
  let passwordVerify;
  let emailVerify;
  if ('email' in req.body){
    emailLength = email.length;
    emailVerify = isEmailValid(email);
  }
  if ('password' in req.body){
    passwordLength = password.length;
    passwordVerify = passwordLength >= 6;
  }
  switch (true) {
    case (passwordLength === 0) :
      return res.status(400).json({
        "message": "O campo \"password\" é obrigatório"
      })
    case (passwordVerify === false) :
      return res.status(400).json({
        "message": "O \"password\" deve ter pelo menos 6 caracteres"
      })
    case (emailLength === 0) :
      return res.status(400).json({
        "message": "O campo \"email\" é obrigatório"
      })
    case (emailVerify === false) :
      return res.status(400).json({
        "message": "O \"email\" deve ter o formato \"email@email.com\""
      })
    case (passwordVerify && emailVerify) :
      const result = tokenGenerator();
      return res.status(200).json({
        "token": result
      })
    default:
      return res.status(500);
  }
});

app.post('/talker',  
tokenValidation, 
ageValidation,
nameValidation,
talkValidation,
async (req, res) => {
  const { name, age, talk: {rate, watchedAt} } = req.body;
  const talkers = await importData();
  const newTalker = {
    name,
    age,
    id: talkers.length + 1,
    talk: {
      watchedAt,
      rate,
    }
  };
  talkers.push(newTalker);
  await fs.writeFile(path.resolve(`${__dirname}/${path_file}`), JSON.stringify(talkers));
  return res.status(201).json(newTalker)
});

app.put('/talker/:id',
tokenValidation,
nameValidation,
ageValidation,
talkValidation,
async (req, res) => {
  const { name, age, talk: {rate, watchedAt} } = req.body;
  const { id } = req.params;
  const talkers = await importData();
  const findTalker = talkers.findIndex((el) => el.id === Number(id));
  if (findTalker === -1) {
    return res.status(404).json({
      "message": "Pessoa palestrante não encontrada"
    })
  }
  const newTalker = { name, age, id: Number(id), talk: {rate, watchedAt} }
  talkers[findTalker] = newTalker;
  await fs.writeFile(path.resolve(`${__dirname}/${path_file}`), JSON.stringify(talkers));
  return res.status(200).json(newTalker)

});

app.delete('/talker/:id',
tokenValidation, async (req,res) => {
  const { id } = req.params;
  const talkers = await importData();
  const newTalkers = talkers.filter((talker) => talker.id !== Number(id));
  await fs.writeFile(path.resolve(`${__dirname}/${path_file}`), JSON.stringify(newTalkers));
  return res.sendStatus(204);
})


app.listen(PORT, () => {
  console.log('Online');
});

module.exports = app;
