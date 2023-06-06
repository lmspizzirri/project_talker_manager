const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { ageValidation } = require('./middlewares/ageValidate');
const { tokenValidation } = require('./middlewares/authValidate');
const { nameValidation } = require('./middlewares/nameValidate');
const { talkValidation } = require('./middlewares/talkValidate');
const importData = require('./service/importData');
const { rateValidation } = require('./middlewares/rateValidate');
const { dateValidation } = require('./middlewares/dateValidate');
const { rateQueryValidation } = require('./middlewares/rateQueryValidate');
const { dateQueryValidation } = require('./middlewares/dateQueryValidate');
const { rateBodyValidation } = require('./middlewares/rateBodyValidate');
const { emailVerify, passwordVerify } = require('./middlewares/loginVerify');
const tokenGenerator = require('./service/tokenGenerator');

const app = express();
app.use(express.json());

const pathFile = '/talker.json';
const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_req, res) => {
  const talkers = await importData();
  return res.status(200).json(talkers);
});

app.get('/talker/search',
tokenValidation,
rateQueryValidation,
dateQueryValidation,
 async (req, res) => {
  const { q, rate, date } = req.query;
  const talkers = await importData();
  if (!talkers) { return res.status(HTTP_OK_STATUS).json([]); }
  let finalTalker = talkers;
  if (q) { finalTalker = finalTalker.filter((talker) => talker.name.includes(q)); }
  if (rate) { finalTalker = finalTalker.filter((talker) => talker.talk.rate === Number(rate)); }
  if (date) { finalTalker = finalTalker.filter((talker) => talker.talk.watchedAt === date); }
  return res.status(HTTP_OK_STATUS).json(finalTalker);
});

app.patch('/talker/rate/:id', 
tokenValidation,
rateBodyValidation, async (req, res) => {
  const { id } = req.params;
  const { rate } = req.body;
  const talkers = await importData();
  const findTalker = talkers.findIndex((talker) => talker.id === Number(id));
  if (findTalker === -1) {
    return res.status(404).json({
      message: 'Pessoa palestrante não encontrada',
    });
  }
  talkers[findTalker].talk.rate = rate;
  await fs.writeFile(`${__dirname}/${pathFile}`, JSON.stringify(talkers));
  return res.status(204).json(talkers[talkers]);
});

app.get('/talker/:id',
 async (req, res) => {
  const { id } = req.params;
  const talkers = await importData();
  const findId = talkers.filter((talker) => talker.id === Number(id));
  if (findId.length > 0) {
    return res.status(200).json(findId[0]);
  } 
  return res.status(404).json({
    message: 'Pessoa palestrante não encontrada',
  });
});

app.post('/login', 
emailVerify,
passwordVerify,
async (_req, res) => {
    const result = tokenGenerator();
    return res.status(200).json({
      token: result,
      });
  },);

app.post('/talker',  
tokenValidation, 
ageValidation,
nameValidation,
talkValidation,
rateValidation,
dateValidation,
async (req, res) => {
  const { name, age, talk: { rate, watchedAt } } = req.body;
  const talkers = await importData();
  const newTalker = {
    name,
    age,
    id: talkers.length + 1,
    talk: {
      watchedAt,
      rate,
    },
  };
  talkers.push(newTalker);
  await fs.writeFile(path.resolve(`${__dirname}/${pathFile}`), JSON.stringify(talkers));
  return res.status(201).json(newTalker);
});

app.put('/talker/:id',
tokenValidation,
nameValidation,
ageValidation,
talkValidation,
rateValidation,
dateValidation,
async (req, res) => {
  const { name, age, talk: { rate, watchedAt } } = req.body;
  const { id } = req.params;
  const talkers = await importData();
  const findTalker = talkers.findIndex((el) => el.id === Number(id));
  if (findTalker === -1) {
    return res.status(404).json({
      message: 'Pessoa palestrante não encontrada',
    });
  }
  const newTalker = { name, age, id: Number(id), talk: { rate, watchedAt } };
  talkers[findTalker] = newTalker;
  await fs.writeFile(path.resolve(`${__dirname}/${pathFile}`), JSON.stringify(talkers));
  return res.status(200).json(newTalker);
});

app.delete('/talker/:id',
tokenValidation, async (req, res) => {
  const { id } = req.params;
  const talkers = await importData();
  const newTalkers = talkers.filter((talker) => talker.id !== Number(id));
  await fs.writeFile(path.resolve(`${__dirname}/${pathFile}`), JSON.stringify(newTalkers));
  return res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log('Online');
});

module.exports = app;
