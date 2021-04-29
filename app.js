const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon')
const path = require('path')
const utility = require("./modules/utility");

const app = express();

const port = 6789;

app.set('view engine', 'ejs');

app.use(expressLayouts);
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')))

let listaIntrebari;
(async () => { listaIntrebari = await utility.asyncReadFile("intrebari.json"); })();

app.get('/', (req, res) => res.render("index"));

app.get('/chestionar', (req, res) => {
	res.render('chestionar', { intrebari: listaIntrebari });
});

app.post('/rezultat-chestionar', (req, res) => {
	res.render('rezultat-chestionar', { intrebari: listaIntrebari, raspunsuri: JSON.stringify(req.body) });
});

app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost: ${port}`));