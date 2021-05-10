const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon')
const path = require('path')
const utility = require("./modules/utility");

const app = express();

app.set('view engine', 'ejs');

app.use(expressLayouts);
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')))

let listaIntrebari;
(async () => { listaIntrebari = await utility.asyncReadFile("intrebari.json"); })();

app.get('/', (req, res) => res.render("index", {
	title: "Toasted",
	styleList: ["index-style.css"]}));
app.get('/chestionar', (req, res) => res.render('chestionar', { 
	title: "Chestionar",
	styleList: ["quiz-style.css"],
	intrebari: listaIntrebari
 }));
app.get('/autentificare', (req, res) => res.render("autentificare", {
	title: "Autentificare",
	styleList: ["auth-style.css"],
}));
app.post('/rezultat-chestionar', (req, res) => res.render('rezultat-chestionar', {
	title: "Rezultate",
	styleList: ["quiz-style.css"],
	intrebari: listaIntrebari, 
	raspunsuri: JSON.stringify(req.body) }));
app.post('/verificare-autentificare', (req, res) => {
	res.redirect("/");
});

const port = 6789;
app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost: ${port}`));