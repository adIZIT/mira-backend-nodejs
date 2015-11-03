var express = require('express');
var sql 	= require('mssql');
var config  = require('../config');
var router 	= express.Router();
var app 	= express();

// POST: /authenticate
router.route('/authenticate').post(function(req, res) {	
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
									expiresInMinutes: 1440
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
})