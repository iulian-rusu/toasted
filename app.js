const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')

const app = express();

const port = 6789;

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');

// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);

// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))

// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());

// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.get('/', (req, res) => res.render("layout", {body: "Hello World"}));

const listaIntrebari = [
	{
		intrebare: 'Care e rolul unui toaster?',
		variante: ['Face toasturi', 'Execută aplicații', 'Încălzește apa', 'Nu are niciun rol'],
		corect: 0
	},
	{
		intrebare: 'În ce an a apărut primul toaster?',
		variante: ['1389', '1839', '1893', '1983'],
		corect: 2
	},
	{
		intrebare: 'Ce putere consumă un toaster mediu?',
		variante: ['100 cai putere', '10 W', '100 W', '1.35962 cai putere'],
		corect: 3
	},
	{
		intrebare: 'Unde puteți cumpăra cele mai bune toaster?',
		variante: ['Aici!', 'Nu în alte magazine', 'Pe toasted.com', 'Toate variantele dinainte'],
		corect: -1
	}
];

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
app.get('/chestionar', (req, res) => {
	// în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
	res.render('chestionar', {intrebari: listaIntrebari});
});

app.post('/rezultat-chestionar', (req, res) => {
	console.log(JSON.stringify(req.body));
	res.render('rezultat-chestionar', {intrebari: listaIntrebari, raspunsuri: JSON.stringify(req.body)});
});

app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));