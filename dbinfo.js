module.exports = {	
	project: {
		table: 'tbl_projects',
		tableAlias: 'p',
		columns: [
			{ "columnName": "id", "alias": "projectId" },
			{ "columnName": "name", "alias": "projectName" },
			{ "columnName": "code", "alias": "projectCode" },
			{ "columnName": "remarks", "alias": "projectRemarks" }						
		],
		relations: [
			{ 
				"customer": {
					"type": "belongsTo",
					"model": "customer",
					"foreignKey": "customerId"	
				}			
			}
		]
	},
	customer: {
		table: 'tbl_customers', 
		tableAlias: 'c',
		identityfield: 'id',
		columns: [
			{ "colName": "id", "alias": "customerId" },
			{ "colName": "name", "alias": "customerName" }
		]
	}	
}