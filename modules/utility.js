const fs = require('fs');
const nameRegex = /^[^<>]+$/;

module.exports = {
    asyncReadFile: filename => {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) {
                    throw err;
                }
                resolve(JSON.parse(data));
            });
        });
    },
    sanitizeInput: input => {
        return input.trim().split("'").join("\\'");
    },
    validateName: name => nameRegex.test(name),
    isNumeric: str => {
    if (typeof str != "string")
        return false
    return !isNaN(str) && !isNaN(parseFloat(str)) 
    }
};