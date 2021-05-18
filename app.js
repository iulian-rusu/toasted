const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon')
const path = require('path')
const session = require('express-session')
const utility = require("./modules/utility");
const DB = require("./modules/database");

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

app.get('/', (req, res) => {
	if(db) {
		db.getAllProducts(prods => {
			res.render("index", {
				session: req.session,
				title: "Toasted",
				styleList: ["index-style.css"],
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
			req.session.user = {
				username: u.username,
				email: u.email,
				phone: u.phone,
				firstName: u.firstName,
				lastName: u.lastName,
				basket: u.basket
			};
			res.redirect("/");
			return;
		}
	}
	res.cookie('error', 'Date invalide', { maxAge: 1000 });
	res.redirect("/autentificare");
});
app.get('/vizualizare-cos', (req, res) => {
	if (!req.session.user) {
		res.cookie('error', 'Trebuie să fiți autentificați pentru această acțiune', { maxAge: 1000 });
		res.redirect("/autentificare");
		return;
	}
	console.log(req.session.user.basket);
	res.render('vizualizare-cos', {
		title: "Coșul meu",
		session: req.session,
		styleList: ["basket-style.css"],
		basket: req.session.user.basket
	});
});
app.get('/logout', (req, res) => {
	req.session.user = null;
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
app.get('/adauga-cos', (req, res) => {
	if(!req.session.user) {
		res.cookie('error', 'Trebuie să fiți autentificați pentru această acțiune', { maxAge: 1000 });
		res.redirect("/autentificare");
		return;
	}
	db.getOneProduct(req.query.id, rows => {
		if(rows) {
			const prod = rows[0];
			prod.quantity = 1;
			req.session.user.basket.push(prod);
		}
	});
});

const port = 6789;
app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost: ${port}`));