function tokenGenerator() {
    let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let counter = 0;
      while (counter < 16) {
        result += characters.charAt(Math.floor(Math.random() * 16));
        counter += 1;
      }
    return result;
}

module.exports = tokenGenerator;
