var express = require('express');
var sql 	= require('mssql');
var config  = require('../config');
var router 	= express.Router();

// GET: /projects/
// Geeft een lijst van alle projecten 
router.route('/projects').get(function(req, res) {
	console.log('GET /projects');
	console.log(req);
	
	var connection = new sql.Connection(config.dbCustomers, function(err) {
		if (err) {
			res.json('Error on connection');
		};
		
		var where = "";
		if (req.query.name) {
			where += ' where name like \'%' + req.query.name + '%\'';
		}
		
		var request = new sql.Request(connection);
		var query = 'select * from tbl_projects' + where;
		console.log(query);
		request.query(query, function(err, recordset) {
			res.json(recordset);
		});
	});
});

// GET: /projects/:id
// Geeft 1 specifiek object terug
router.route('/projects/:id').get(function(req, res) {
	console.log('GET /projects/' + req.params.id);
	var connection = new sql.Connection(config.dbCustomers, function(err) {
		if (err) {			
			res.json('Error on connection');
		};
	
		var request = new sql.Request(connection);
		var query = 'select * from tbl_projects where id = ' + req.params.id;
		console.log(query);
		request.query(query, function(err, recordset) {
			res.json(recordset);
		});
	});
});

// POST: /projects
// Toevoegen van een project
router.route('/projects').post(function(req, res) {
	console.log('POST /projects/');
	console.log('------------------------------');
	console.log(req.body);
	console.log('------------------------------');
	var connection = new sql.Connection(config.dbCustomers, function(err) {
		if (err) {
			res.json('Error on connection');
		};
		
		var ps = new sql.PreparedStatement(connection);
		ps.input('Name', sql.VarChar(50));
		ps.input('Remarks', sql.VarChar(50));
		ps.input('Barcode', sql.VarChar(50));

		var query = 'insert into tbl_projects (Name, Remarks, IsActive, Barcode) values (@Name, @Remarks, 1, @Barcode)';
		
		ps.prepare(query, function(err) {
			ps.execute({ 
				Name: req.body.Name,
				Remarks: req.body.Remarks,
				Barcode: req.body.Barcode
			}, function(err, recordset) {
				ps.unprepare(function(err) {
					if (err) {
						res.send(err);
					}
					else { 
						console.log('Project successfully added');
						res.send('Project successfully added');					
					}
				});
			});
		});		
	});
})


// PUT: /projects
// Update van een project
router.route('/projects/:id').put(function(req, res) {
	console.log('PUT project id:' + req.params.id);
	console.log(req.body);
	var connection = new sql.Connection(config.dbCustomers, function(err) {
		if (err) {
			res.json('Error on connection');
		};
		
		var ps = new sql.PreparedStatement(connection);
		ps.input('Name', sql.VarChar(50));
		ps.input('Remarks', sql.VarChar(50));
		ps.input('Barcode', sql.VarChar(50));
		ps.input('Id', sql.Int);

		var query = 'update tbl_projects set Name=@Name, Remarks=@Remarks, Barcode=@Barcode where Id = @Id';
		
		ps.prepare(query, function(err) {
			ps.execute({ 
				Name: req.body.Name,
				Remarks: req.body.Remarks,
				Barcode: req.body.Barcode,
				Id: req.params.id
			}, function(err, recordset) {
				ps.unprepare(function(err) {
					if (err) {
						res.send(err);
					}
					else { 
						console.log('UPDATE project with id ' + req.params.id + " is succesfully executed"); 
						res.send('UPDATE project with id ' + req.params.id + " is succesfully executed"); 
					}
				});
			});
		});		
	});
})

// DELETE: /projects/:id
// Verwijderen 
router.route('/projects/:id').delete(function(req, res) {
	console.log('DELETE /projects/' + req.params.id);	
	
	var connection = new sql.Connection(config.dbCustomers, function(err) {
		if (err) {
			res.json('Error on connection');
		};
	
		var request = new sql.Request(connection);
		var query = 'delete from tbl_projects where Id = ' + req.params.id;
		console.log(query);
		request.query(query, function(err, recordset) {
			console.log("Project with id " + req.params.id + " is succesfully deleted");
			res.send("Project with id " + req.params.id + " is succesfully deleted");
		});
	});
})

module.exports = router;
