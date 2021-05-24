const fs = require('fs');
const nameRegex = /^[^'"<>]+$/;

module.exports = {
    asyncReadFile: filename => {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });
    },
    validateName: name => nameRegex.test(name),
    getIP: req => req.ip || req.socket.remoteAddress,
    isNumeric: str => {
        if (typeof str != "string")
            return false
        return !isNaN(str) && !isNaN(parseFloat(str))
    }
};