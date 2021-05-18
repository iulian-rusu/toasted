const sqlite3 = require("sqlite3");
const products = [
    [
        "toaster1.png",
        "Generic Toaster",
        "250"
    ],
    [
        "toaster4.png",
        "Generic Toaster",
        "250"
    ],
    [
        "toaster2.png",
        "Generic Toaster",
        "250"
    ],
    [
        "toaster3.png",
        "Generic Toaster",
        "250"
    ],
];

class DB {
    constructor(name, callback) {
        const self = this;
        this.db = new sqlite3.Database(`db/${name}`, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log('Connected to the shop database.');
            self.db.run('CREATE TABLE IF NOT EXISTS products(img TEXT, name TEXT, price INT)', err => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                callback();
            });
        });
    }

    insertProducts(callback) {
        const self = this;
        products.forEach(value => {
            self.db.run(`INSERT INTO products(img, name, price) VALUES(?, ?, ?)`, value, err => {
                if (err) {
                    console.log(err.message);
                    return;
                }
                console.log("Inserted products into database");
            });
        });
        callback();
    }
}

module.exports = DB;