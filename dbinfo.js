module.exports = {	
	project: {
		table: 'tbl_projects',
		columns: [
			{ "colName": "p.Id", "alias": "projectId" },
			{ "colName": "p.Name", "alias": "projectName" },
			{ "colName": "p.Barcode", "alias": "projectCode" },
			{ "colName": "p.Remarks", "alias": "projectRemarks" },
			{ "colName": "p.IsActive", "alias": "projectIsActive" }			
		]
	},
	customer: {
		table: 'tbl_customers', 
		columns: [
			{ "colName": "c.Id", "alias": "customerId" },
			{ "colName": "c.Name", "alias": "customerName" }
		]
	}	
}