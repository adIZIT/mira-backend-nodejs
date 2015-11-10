var express 	= require('express');
var sql 		= require('mssql');
var config  	= require('../config');
var validator	= require('validator');
var dbinfo		= require('../dbinfo');
var router 		= express.Router();

/*
	======== ALGEMEEN ========
	GET:	/projects		Geeft een lijst van alle projecten
	GET:	/projects/:id	Geeft een project met een specifiek Id
	POST:	/projects		Toevoegen van een nieuw project
	PUT:	/projects		Update van een bestaand project
	DELETE: /projects/:id	Verwijderen van een project
	
	======== EXTRA ========
	GET:	/projects/:id/Customer		Ophalen van een klant van een project
	
	======== FILTERS =========
	include:	customer		syntax: filter={include:'customer'}
										filter={include:['customer', '...', ...]}
	where:						syntax:	filter={where:{property: value}}
										filter:{where:{property: {op: value}}}
										filter:{where:{property: {: value}, property2: value2}}
*/

// GET: /projects/
// Geeft een lijst van alle projecten 
router.route('/projects').get(function(req, res) {	
	var connection = new sql.Connection(config.dbCustomers, function(err) {
		if (err) {
			res.json('Error on connection');
		};
		
		var fields = [];
		
		for(var i=0; i<dbinfo.project.columns.length; i++) {
			fields.push(dbinfo.project.columns[i]);	
		}

		var joins = ''
		var selectColumns = '';
		
		// Indien een filter wordt toegepast 
		if (req.query.filter) {
			// Controle op include			
			var filter = JSON.parse(req.query.filter);
			if (filter.include) {				
				// Nakijken of de include het veld "customer" bevat om zo de joins te kunnen implementeren
				if (filter.include === 'customer') {	
					for(var i=0; i<dbinfo.customer.columns.length; i++) {
						fields.push(dbinfo.customer.columns[i]);	
					}
					joins += 'left join tbl_customers c on c.Id = p.Customer_Id ';
				}	
			}
						
			// Controle op where
			if (filter.where) {
				
			}
			
			// Controle op order
			if (filter.order) {
				
			}
		}
		
		// Alle kolommen doorlopen die in de select moeten zitten
		for(var i=0; i<fields.length; i++) {
			selectColumns += fields[i].colName + " as '" + fields[i].alias + "'";
			if (i != fields.length - 1) {
				selectColumns += ', ';
			}
		}
		
		var query = 'select '
				  + selectColumns 				 
				  + 'from tbl_projects p '
				  + joins;
		console.log(query);
		var request = new sql.Request(connection);
			
		request.query(query, function(err, recordset) {
			generateJsonFromRecordset(recordset, function(projects) {
				console.log(projects);
				res.json(projects);
			});
		});
	});
});

function generateJsonFromRecordset(recordset, callback) {
	var projects = [];

	for(var i=0; i<recordset.length; i++) {
		var p = {
			"Id": recordset[i].projectId,
			"Name": recordset[i].projectName,
			"Remarks": recordset[i].projectRemarks,
			"Code": recordset[i].projectCode
		}
		if (recordset[i].customerId) {
			p.customer = {
				"Id": recordset[i].customerId,
				"Name": recordset[i].customerName
			}
		}
		projects.push(p);
	}
	
	callback(projects);
}

// GET: /projects/:id
// Geeft 1 specifiek object terug
router.route('/projects/:id').get(function(req, res) {	
	var connection = new sql.Connection(config.dbCustomers, function(err) {
		if (err) {			
			res.json('Error on connection');
		};
	
		var request = new sql.Request(connection);
		var query = 'select * from tbl_projects where id = ' + req.params.id;	
		request.query(query, function(err, recordset) {
			res.json(recordset);
		});
	});
});

// POST: /projects
// Toevoegen van een project
router.route('/projects').post(function(req, res) {	
	validateProject(req.body, function(project, err) {
		if (err) {
			res.status(400).send(err);
			return;
		}
		
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
					Name: project.Name,
					Remarks: project.Remarks,
					Barcode: project.Code
				}, function(err, recordset) {
					ps.unprepare(function(err) {
						if (err) {
							res.send(err);
						}
						else { 		
							res.send('Project successfully added');					
						}
					});
				});
			});		
		});
	});
});

function validateProject(project, callback) {
	// Lijst die alle errors bevat na validatie
	var errors = [];
	
	
	// Alle values van het project object trimmen zodat alle whitespaces weg zijn
	if (project.Name) { project.Name = validator.trim(project.Name); }
	if (project.Code) { project.Code = validator.trim(project.Code); }
	if (project.Remarks) { project.Remarks = validator.trim(project.Remarks); }
	
	// Controle of de naam van een project ingevuld is
	if (validator.isNull(project.Name)) {
		errors.push({ 'status': 400, 'message': 'Project name is required', 'code': '21001' });
	}
	
	// Controle of de code van een project ingevuld is
	if (validator.isNull(project.Code)) {
		errors.push({ 'status': 400, 'message': 'Project code is required', 'code': '21002' });
	} else {
		// Controle of de code Alfanumeriek is
		if (!validator.isAlphanumeric(project.Code)) {
			errors.push({ 'status': 400, 'message': 'Project code must be alphanumeric', 'code': '21005' });
		}
	}
	
	// Als voorgaande validatie geen error bevat dan wordt er in de database gekeken of er al een project met die naam of code bestaat
	
	if (errors.length == 0) {
		checkProjectNameExists(project.Name, function(err) {
			if (err) {
				errors.push(err);
			}
			checkProjectCodeExists(project.Code, function(err) {
				if (err) {
					errors.push(err);
				}				
				if (errors.length > 0) {
					callback(project, { 'errors': errors });
				} else {
					callback(project);	
				}				
			})
		});
	}
	else {
		if (typeof callback === 'function') {
			if (errors.length > 0) {
				callback(project, { 'errors': errors });
			} else {
				callback(project);	
			}	
		}
	}
}

function checkProjectNameExists(projectname, callback) {
	var connection = new sql.Connection(config.dbCustomers, function(err) {
		if (err) {
			console.log(err);
		};
			
		var ps = new sql.PreparedStatement(connection);
		ps.input('Name', sql.VarChar(50));
		var query = 'select count(Id) as c from tbl_projects where Name = @Name';
			
		ps.prepare(query, function(err) {
			ps.execute({ 
				Name: projectname.toLowerCase()
			}, function(err, recordset) {
				ps.unprepare(function(err) {
					if (err) {
						console.log(err);
					}
					else {							
													
						if (recordset[0].c > 0) {
							var error = ({ 'status': 400, 'message': 'Project name already exists', 'code': '21003' });
							callback(error);
						}
						else {
							callback()	
						}																							
					}
				});				
			});
		});	
	});
}

function checkProjectCodeExists(projectcode, callback) {
	var connection = new sql.Connection(config.dbCustomers, function(err) {
		if (err) {
			console.log(err);
		};
			
		var ps = new sql.PreparedStatement(connection);
		ps.input('Code', sql.VarChar(50));
		var query = 'select count(Id) as c from tbl_projects where Barcode = @Code';
			
		ps.prepare(query, function(err) {
			ps.execute({ 
				Code: projectcode.toLowerCase()
			}, function(err, recordset) {
				ps.unprepare(function(err) {
					if (err) {
						console.log(err);
					}
					else {							
													
						if (recordset[0].c > 0) {
							var error = ({ 'status': 400, 'message': 'Project code already exists', 'code': '21004' });
							callback(error);
						}
						else {
							callback()	
						}																							
					}
				});				
			});
		});	
	});
}


// PUT: /projects
// Update van een project
router.route('/projects/:id').put(function(req, res) {	
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
