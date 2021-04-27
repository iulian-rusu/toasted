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
    }
};