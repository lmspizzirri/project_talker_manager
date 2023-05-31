const fs = require('fs/promises');
const path = require('path');

const talkerPath = path.resolve(__dirname, '../talker.json');

const importData = async () => {
    const data = await fs.readFile(path.resolve(talkerPath), 'utf-8');
    const talkers = JSON.parse(data);
    return talkers;
}

module.exports = importData;