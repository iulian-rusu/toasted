const sqlite3 = require("sqlite3");
const products = [
    [
        "toaster1.png",
        "Breville Die-Cast 2-Slice Smart Toaster",
        "149"
    ],
    [
        "toaster2.png",
        "Cuisinart Toaster, 4-Slice, Brushed Stainless",
        "129"
    ],
    [
        "toaster3.png",
        "Hamilton Beach Extra Wide Slot Toaster",
        "89"
    ],
    [
        "toaster4.png",
        "Cuisinart CPT-320P1 Extra Wide Slot Toaster",
        "99"
    ],
    [
        "toaster5.png",
        "Zwilling Enfinigy Cool Touch",
        "179"
    ],
    [
        "toaster6.png",
        "Cuisinart RBT-4900PCFR Stainless Steel",
        "139"
    ],
    [
        "toaster7.png",
        "Oster 2 Slice, Bread, Bagel Toaster, Metallic Grey",
        "139"
    ]

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
            self.db.run('CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT, img TEXT, name TEXT, price INTEGER, UNIQUE(name))', err => {
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
                    return;
                }
                console.log("Inserted products into database");
                console.log(value);
            });
        });
        callback();
    }
    
    getAllProducts(callback) {
        this.db.all("SELECT * FROM products", [], (err, rows) => {
            if (err) {
                console.log(err.message);
                return;
            }
            callback(rows);
        });
    }

    getOneProduct(id, callback) {
        this.db.all(`SELECT * FROM products WHERE id=${id}`, [], (err, rows) => {
            if (err) {
                console.log(err.message);
                return;
            }
            callback(rows);
        });
    }
}

module.exports = DB;