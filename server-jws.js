var express			= require('express');
var app				  = express();
var bodyParser	= require('body-parser');
var morgan		  = require('morgan');
var jwt				  = require('jsonwebtoken');
var sql 	      = require('mssql');

var port = process.env.PORT || 8080;

app.set('supersecret', 'mirasecret');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

var config = {
		user: 'izitbvba@outlook.com@mira-izit',
		password: '1Z1Taoutlook',
		server: 'mira-izit.database.windows.net',
		database: 'mira-izit',
		options: {
			encrypt: true // nodig om te connecteren met Windows Azure
		}
	}

app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.get('/setup', function(req, res) {
  var connection = new sql.Connection(config, function(err) {
		if (err) {
			res.json('Error on connection');
		};
		
		var ps = new sql.PreparedStatement(connection);
		ps.input('name', sql.VarChar(50));
		ps.input('email', sql.VarChar(50));
		ps.input('password', sql.VarChar(50));

		var query = 'insert into tbl_users (name, email, password) values (@name, @email, @password)';
		
		ps.prepare(query, function(err) {
			ps.execute({ 
				name: 'Ad',
				email: 'ad@izit.be',
				password: '123456'
			}, function(err, recordset) {
				ps.unprepare(function(err) {
					if (err) {
						res.send(err);
					}
					else { 						
						res.json({ success: true });					
					}
				});
			});
		});		
	});
});

var apiRoutes = express.Router(); 

apiRoutes.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    console.log(token);
   if (token) {

      // verifies secret and checks exp
      jwt.verify(token, app.get('supersecret'), function(err, decoded) {      
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });    
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next();
        }
      });
  
    } else {
  
      // if there is no token
      // return an error
      return res.status(403).send({ 
          success: false, 
          message: 'No token provided.' 
      });
    
  }
});

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

apiRoutes.get('/users', function(req, res) {
  var connection = new sql.Connection(config, function(err) {
		if (err) {
			res.json('Error on connection');
		};
				
		var request = new sql.Request(connection);
		var query = 'select * from tbl_users';
		request.query(query, function(err, recordset) {
			res.json(recordset);
		});
	});
}); 

apiRoutes.post('/authenticate', function(req, res) {
  var connection = new sql.Connection(config, function(err) {
		if (err) {			
			res.json('Error on connection');
		};
	
		var request = new sql.Request(connection);
		var query = "select * from tbl_users where email = '" + req.body.email + "'";
		request.query(query, function(err, recordset) {
			 if (err) throw err;
       console.log(recordset);
       console.log(recordset.length);
       if (recordset.length == 0) {
          res.json({ success: false, message: 'Authentication failed. User not found' });
       } else if (recordset) {
          // Check if password matches
          if (recordset[0].password != req.body.password) {
              res.json({ success: false, message: 'Authentication failed. Wrong password' });
          } else {
              var token = jwt.sign(recordset, app.get('supersecret'), {
                  expiresInMinutes: 1440
              });
              
              res.json({
                  success: true,
                  message: 'Enjoy your token',
                  token: token
              });
          }
       }
		});
	});
})



app.use('/api', apiRoutes);

app.listen(port);
console.log('Magic happens at http://localhost:' + port);