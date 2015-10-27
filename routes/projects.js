var express = require('express');
var sql 	= require('mssql');
var router 	= express.Router();

// GET: /projects/
// Geeft een lijst van alle projecten 
router.route('/projects').get(function(req, res) {
	
	console.log(req);
	
	var config = {
		user: 'izitbvba@outlook.com@mira-izit',
		password: '1Z1Taoutlook',
		server: 'mira-izit.database.windows.net',
		database: 'mira-izit',
		options: {
			encrypt: true // nodig om te connecteren met Windows Azure
		}
	}
	
	var connection = new sql.Connection(config, function(err) {
		if (err) {
			res.json('Error on connection');
		};
		
		var request = new sql.Request(connection);
		request.query('select * from tbl_projects', function(err, recordset) {
			res.json(recordset);
		});
	});
});

module.exports = router;