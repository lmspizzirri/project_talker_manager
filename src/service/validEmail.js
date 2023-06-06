function isEmailValid(email) {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email) {
        return false; 
    }
    const valid = emailRegex.test(email);
    if (!valid) {
        return false; 
    }
    return true;
};

module.exports = isEmailValid;