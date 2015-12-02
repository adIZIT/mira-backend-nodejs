module.exports = {
	
// 		include:	customer		syntax: filter={include:'customer'}
// 										filter={include:['customer', '...', ...]}
// 	where:						syntax:	filter={where:{property: value}}
// 										filter:{where:{property: {op: value}}}
// 										filter:{where:[{property: {: value}, {property2: value2}]}
// 	order:						syntax: filter:{order: {property:  }}
// 
// */
// 
// var order = [
// 	{
// 		'field': '',
// 		'orderType': ''
// 	},
// 	{
// 		'field': '',
// 		'orderType': ''
// 	}
// ]
	
	// Test voor project
	filter: {		
		include: [
			'customer',
			'customer.address'
		],
		where: [			
			[
				{ 'customer.name': 'Ad' },
				{ 'remarks': { 'like': 'Test'} }
			]
		],
		where2: {			 
			'or': [
					{
						'and': [ 
							{ 'field1': 'foo' }, 
							{ 'field2': { 'like': 'bar' } } 
						]
					},
					{
						'field3': 'bla'
					}	
			]
					
		},
		order: [
			{ 'id': 'desc'},
			{ 'name': 'asc'}	
		],
		limit: {
			
		}
	},
	test: {
		"or": [
			"and": [ {"field1": "foo"}, {"field2": "bar"}  ],
			"field1": "morefoo"
		]
	}
	
	createQuery: function(filter, tables, startObject) {
		var joins = [];
		var where = [];
		
		// Controle of er een include variabele aanwezig om de nodige joins al te voorzien
		if (filter.include) {
			// Elke property doorlopen waarvoor een join moet aangemaakt worden
			for(var propertyName in filter.include) {
				// Indien het gaat over een gerelateerd object wordt deze gescheiden door een .  bvb voor project -> customer.address
				var fields = propertyName.split('.');
				// Voor elk veld de join aanmaken
				for (var index = 0; index < fields.length; ++index) {
					if (index === 0) {
						joins.push('left join ' + tables[fields[index]].table + ' as ' + tables[fields[index]].tableAlias + ' on ' + tables[fields[index]].tableAlias + '.' + tables[fields[index]].identityField + ' = ' + tables[startObject].tableAlias + '.' + tables[startObject].identityField);	
					} else {
						joins.push('left join ' + tables[fields[index]].table + ' as ' + tables[fields[index]].tableAlias + ' on ' + tables[fields[index]].tableAlias + '.' + tables[fields[index]].identityField + ' = ' + tables[fields[index]].tableAlias + '.' + tables[fields[index]].identityField);
					}					
				}				
			}
		}
		
		if (filter.where) {
			
		}
	}
}