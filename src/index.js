const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';
const path_file = '/talker.json'

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (req, res) => {
  const data = await fs.readFile(path.resolve(`${__dirname}/${path_file}`), 'utf-8')
  const talkers = JSON.parse(data);
  return res.status(200).json( talkers );
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const data = await fs.readFile(path.resolve(`${__dirname}/${path_file}`), 'utf-8')
  const talkers = JSON.parse(data);
  const findId = talkers.filter((talker) => talker.id === Number(id));
  if( findId.length > 0 ){
    return res.status(200).json( findId[0] );
  } else {
    return res.status(404).json( {
      "message": "Pessoa palestrante não encontrada"
    });
  }
});

app.listen(PORT, () => {
  console.log('Online');
});

module.exports = app;
