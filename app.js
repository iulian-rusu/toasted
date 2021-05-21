const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon')
const path = require('path')
const session = require('express-session')
const utility = require("./modules/utility");
const DB = require("./modules/database");
const { getIP } = require('./modules/utility');

const app = express();
let db = null;

app.set('view engine', 'ejs');

app.use(expressLayouts);
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')))
app.use(session({
	secret: '$up3r-$3cr3t',
	resave: true,
	saveUninitialized: true
}));

let listaIntrebari, listaUtilizatori;
(async () => { listaIntrebari = await utility.asyncReadFile("intrebari.json"); })();
(async () => { listaUtilizatori = await utility.asyncReadFile("utilizatori.json"); })();

const MAX_LOGIN_FAILS_SHORT = 3;
const MAX_LOGIN_FAILS_LONG = 10;

let blockedIPs = [];
let failedLoginsShort = {}
let failedLoginsLong = {}

function addOrSet(obj, key, value = 1) {
	if (obj[key]) {
		obj[key] += value;
	}
	else {
		obj[key] = value;
	}
}

setInterval(() => failedLoginsShort = {}, 10_000); // up to 3 failed logins every 10 seconds
setInterval(() => failedLoginsLong = {}, 120_000); // up to 10 failed logins every 2 minutes

function isBlocked(ip) {
	return blockedIPs.indexOf(ip) > -1;
}

function blockIP(ip, timeout) {
	blockedIPs.push(ip);
	setTimeout(() => blockedIPs = blockedIPs.filter(x => x != ip), timeout);
}

// middleware to check if session is blocked
app.use((req, res, next) => {
	res.locals.error = req.cookies['error'];
	const ip = utility.getIP(req);
	if (isBlocked(ip)) {
		res.render('blocked', {
			session: req.session,
			title: "Oops...",
			styleList: ["blocked-style.css"]
		});
	} else {
		next();
	}
});

app.get('/', (req, res) => {
	if (db) {
		db.getAllProducts(prods => {
			res.render("index", {
				session: req.session,
				title: "Toasted",
				styleList: ["index-style.css", "product-table-style.css"],
				products: prods
			});
		})
	} else {
		res.render("index", {
			session: req.session,
			title: "Toasted",
			styleList: ["index-style.css"],
			products: null
		});
	}
});
app.get('/chestionar', (req, res) => res.render('chestionar', {
	title: "Chestionar",
	session: req.session,
	styleList: ["quiz-style.css"],
	intrebari: listaIntrebari
}));
app.get('/autentificare', (req, res) => {
	if (failedLoginsShort[getIP(req)] >= MAX_LOGIN_FAILS_SHORT
		|| failedLoginsLong[getIP(req)] >= MAX_LOGIN_FAILS_LONG) {
		res.cookie('error', 'Prea multe autentificari esuate', { maxAge: 1000 });
		res.redirect("/");
		return;
	}
	res.render("autentificare", {
		error: req.cookies['error'],
		title: "Autentificare",
		session: req.session,
		styleList: ["auth-style.css"],
	});
});
app.post('/rezultat-chestionar', (req, res) => res.render('rezultat-chestionar', {
	title: "Rezultate",
	session: req.session,
	styleList: ["quiz-style.css"],
	intrebari: listaIntrebari,
	raspunsuri: JSON.stringify(req.body)
}));
app.post('/verificare-autentificare', (req, res) => {
	const username = req.body["username"];
	const password = req.body["password"];
	for (const u of listaUtilizatori) {
		if (u.username == username && u.password == password) {
			req.session.user = Object.assign({}, u);
			req.session.user.password = null;
			req.session.basket = [];
			res.redirect("/");
			return;
		}
	}
	addOrSet(failedLoginsShort, getIP(req));
	addOrSet(failedLoginsLong, getIP(req));

	res.cookie('error', 'Date invalide', { maxAge: 1000 });
	res.redirect("/autentificare");
});
app.get('/basket', (req, res) => {
	if (!req.session.user) {
		res.cookie('error', 'Trebuie să fiți autentificați pentru această acțiune', { maxAge: 1000 });
		res.redirect("/autentificare");
		return;
	}
	res.render('vizualizare-cos', {
		title: "Coșul meu",
		session: req.session,
		styleList: ["basket-style.css"],
		basket: req.session.basket
	});
});
app.get('/logout', (req, res) => {
	req.session.user = null;
	req.session.basket = null;
	res.redirect('/autentificare');
});
app.post('/creare-bd', (req, res) => {
	db = new DB("shop.db", () => res.redirect('/'));
});
app.post('/inserare-bd', (req, res) => {
	if (db) {
		db.insertProducts(() => res.redirect('/'));
	} else {
		res.redirect('/');
	}
});
app.get('/add-basket', (req, res) => {
	if (!req.session.user) {
		res.cookie('error', 'Trebuie să fiți autentificați pentru această acțiune', { maxAge: 1000 });
		res.redirect("/autentificare");
		return;
	}
	const id = req.query.id;
	if (!utility.isNumeric(id)) {
		res.cookie('error', 'Date corupte în cerere', { maxAge: 1000 });
		res.redirect("/");
		return;
	}
	db.getOneProduct(id, rows => {
		if (rows) {
			const prod = rows[0];
			const existingProduct = req.session.basket.find(item => item.id === prod.id);
			if (existingProduct) {
				existingProduct.quantity++;
			}
			else {
				prod.quantity = 1;
				req.session.basket.push(prod);
			}
			res.sendStatus(200);
		}
	});
});
app.get('/admin', (req, res) => {
	if (!req.session.user || req.session.user.type != 'admin') {
		const ip = utility.getIP(req);
		blockIP(ip, 10000);
		res.redirect("/");
		return;
	}
	if (db) {
		db.getAllProducts(prods => {
			res.render("admin", {
				session: req.session,
				title: "Administrare",
				styleList: ["admin-style.css", "product-table-style.css"],
				products: prods
			});
		})
	} else {
		res.render("admin", {
			session: req.session,
			title: "Administrare",
			styleList: ["admin-style.css", "product-table-style.css"],
			products: null
		});
	}
});
app.post('/product', (req, res) => {
	const ip = utility.getIP(req);
	if (!req.session.user || req.session.user.type != 'admin') {
		blockIP(ip, 10000);
		res.redirect("/");
		return;
	}
	if (!db) {
		res.cookie('error', 'Baza de date nu a fost inițializată', { maxAge: 1000 });
		res.redirect("/admin");
		return;
	}
	try {
		const name = utility.sanitizeInput(req.body.name);
		if (!utility.validateName(name)) {
			res.cookie('error', 'Injecție de cod detectată', { maxAge: 1000 });
			blockIP(ip, 10000);
			res.redirect("/");
			return;
		}
		const price = Number.parseInt(req.body.price);
		const i = Math.ceil(Math.random() * 7); // random number from 1 to 7
		const prod = {
			name: name,
			price: price,
			img: `toaster${i}.png`
		}
		db.insertOne(prod, () => {
			res.redirect("/admin");
			return;
		})
	} catch {
		res.cookie('error', 'Date corupte în cerere', { maxAge: 1000 });
		res.redirect("/admin");
		return;
	}
});
app.delete("/product", (req, res) => {
	const ip = utility.getIP(req);
	if (!req.session.user || req.session.user.type != 'admin') {
		blockIP(ip, 10000);
		res.sendStatus(403);
		return;
	}
	if (!db) {
		res.cookie('error', 'Baza de date nu a fost inițializată', { maxAge: 1000 });
		res.sendStatus(404);
		return;
	}
	try {
		const id = Number.parseInt(req.body.id);
		db.deleteOne(id, () => {
			res.sendStatus(200);
			return;
		})
	} catch {
		res.cookie('error', 'Date corupte în cerere', { maxAge: 1000 });
		res.sendStatus(404);
		return;
	}
});

// called when the route is not defined above
app.use((req, res) => {
	blockIP(getIP(req), 3000);
	res.render('blocked', {
		session: req.session,
		title: "Oops...",
		styleList: ["blocked-style.css"],
		error: 'Ați accesat o resursa invalida'
	});
});

const port = 6789;
app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost: ${port}`));