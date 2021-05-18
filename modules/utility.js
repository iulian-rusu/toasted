const fs = require('fs');

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
        return input.trim().replace("'", "\\'");
    },
    isNumeric: str => {
    if (typeof str != "string")
        return false
    return !isNaN(str) && !isNaN(parseFloat(str)) 
    }
};