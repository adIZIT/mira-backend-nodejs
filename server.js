// Alle packages ophalen die nodig zijn om de app te runnen
var express     = require('express');
var bodyParser  = require('body-parser');
var projects    = require('./routes/projects');

// Express applicatie initialiseren
var app         = express();

// de express app configureren dat deze bodyParser moet gebruiken om zo de body uit de POST requests te halen
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// De poort waarop de webserver runt
var port = process.env.PORT || 1337;

// Routes opzetten voor de API
// ===================================================================

// Instance maken van de express router
var router = express.Router();

// Test route om te testen of alles werkt 
router.get('/', function(req, res) {
    res.json({ message: 'Alles werkt' });
});

// Router registreren
app.use('/api', router);
app.use('/api', projects);

// Start de server
// ===================================================================
app.listen(port);
console.log('Server listening on port ' + port);