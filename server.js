// Alle packages ophalen die nodig zijn om de app te runnen
var express     = require('express');
var bodyParser  = require('body-parser');
var jwt         = require('jsonwebtoken');
var projects    = require('./routes/projects');
var config      = require('./config');
var sql 		= require('mssql');
var morgan		= require('morgan');

// Express applicatie initialiseren
var app         = express();

// De secret variabele die gebruikt wordt om JSON Web Tokens aan te maken
app.set('supersecret', config.secret);

// de express app configureren dat deze bodyParser moet gebruiken om zo de body uit de POST requests te halen
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));

// De poort waarop de webserver runt
var port = process.env.PORT || 1337;

// Routes opzetten voor de API
// ===================================================================

// Instance maken van de express router
var router = express.Router();

router.post('/authenticate', function(req, res) {	
	var connection = new sql.Connection(config.dbCustomers, function(err) {
		if (err) {
			res.json('Error on connection');
		};
		
		var ps = new sql.PreparedStatement(connection);
		ps.input('email', sql.VarChar(50));
		
		var query = 'select * from tbl_users where email = @email';
		
		ps.prepare(query, function(err) {
			ps.execute({ 
				email: req.body.email
			}, function(err, recordset) {
				ps.unprepare(function(err) {
					if (err) {
						res.send(err);
					}
					else {
						if (recordset.length == 0) {
							res.json({ succes: false, message: 'Authentication failed. User not found' });
						} else {
							if (recordset[0].password != req.body.password) {
								res.json({ success: false, message: 'Authentication failed. Wrong password' });
							} else {
								var token = jwt.sign(recordset, app.get('supersecret'), {
									expiresIn: 1440
								});
								
								res.json({
									success: true,
									message: 'Enjoy your token',
									token: token
								});
							}
						}																	
					}
				});
			});
		});		
	});
});

// Test route om te testen of alles werkt 
router.get('/', function(req, res) {
    res.json({ message: 'Alles werkt' });
});

// Route middelware om tokens te authenticeren en token na te kijken
app.use(function(req, res, next) {   
	
	if (req.path == '/api/authenticate') {
		next(); 
	} 
	else 
	{
		// header, url of post parameters nakijken of de token aanwezig is
		var token = req.body.token || req.params.token || req.headers['x-access-token'];
		
		// Decode token
		if (token) {
			// JWT verifieren 
			jwt.verify(token, app.get('supersecret'), function(err, decoded) {
				if (err) {
					return res.json({ success: false, message: 'Failed to authenticate token'});    
				} else {
					// Indien de token geldig is verder gaan met de request
					console.log(decoded);
					req.decoded = decoded;
					next();
				}            
			});
		} else {
			// Indien er geen token is een error tonen
			return res.status(403).send({ 
				success: false, 
				message: 'No token provided.'
			});
		}
	}
});



// Router registreren
app.use('/api', router);
app.use('/api', projects);


// Start de server
// ===================================================================
app.listen(port);
console.log('Server listening on port ' + port);