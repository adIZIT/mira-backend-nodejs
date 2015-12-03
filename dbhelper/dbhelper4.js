var dbinfo = {
     project: {
		table: 'tbl_projects',
        identityField: 'id',
		tableAlias: 'p',
		columns: [
			{ 
              "columnName": "id", 
              "type": "number"
            },
			{ "columnName": "name" },
			{ "columnName": "code" },
			{ "columnName": "remarks" }						
		],
		relations: { 
		    "customer": {
				"type": "belongsTo",
				"model": "customer",
				"foreignKey": "customerId"	
			}			
		}
		
	},
	customer: {
		table: 'tbl_customers', 
		tableAlias: 'c',
		identityField: 'id',
		columns: [
			{ "colName": "id", "alias": "customerId" },
			{ "colName": "name", "alias": "customerName" }
		]
	},
    address: {
        table: 'tbl_addresses',
        tableAlias: 'a',
        identityField: 'id',
        columns: [
            { "colName": "id", "alias": "addressId" },
            { "colName": "street", "alias": "addressStreet" }
        ],
        relations: {
           "customer": {
			  "type": "belongsTo",
			  "model": "customer",
			  "foreignKey": "address_id"	
		   }	
        }
    }
};

var filter = {
  include: [ 
    'customer.address' 
  ],
  where: {			 
    'and': [
        {'or': [
		{
			'customer.field1': 'foo'
		},                
        {
		    'customer.field2': 'baz'
		},
		{
			'customer.address.field3': { 'like': 'bla' }
        }	
	]},
        {'and': [ 
        { 
            'field4': 'Ad' 
        },
        { 
            'field5': 'Adoo' 
        }
    ]}
    ]

  }};
var getobject = 'project';

var joins = [];
var where = [];
var tableAliases = [];

// Variabele dat de uiteindelijke SQL query bevat
var theQuery = "";

// functie dat de query zal genereren
(function generateQuery() {
  // De select opbouwen
  tableAliases.push({'table': getobject, 'alias': 't0'}); 
  theQuery += 'select * from ' + dbinfo[getobject].table + ' t0';
  
  // Als de query includes bevat
  if (filter.include) {
      for(var propertyName in filter.include) {
        var fields = filter.include[propertyName].split('.');
        for (var i = 0; i < fields.length; ++i) {  
            // controle op de table alias en deze bijhouden in de tableAliases Array
    
            tableAliases.push({'table': fields[i], 'alias': 't' + (i + 1)}); 
            var theAlias = 't' + (i + 1);
            var theJoin = 'left join ' + dbinfo[fields[i]].table + ' ' + theAlias + ' on ';
            var theAlias1 = _.findWhere(tableAliases, { 'table': fields[i] });
            if (i === 0) {
                
                var theAlias2 = _.findWhere(tableAliases, { 'table': getobject });
                console.log(theAlias1);
                console.log(theAlias2);
                theJoin += theAlias1.alias + '.' + dbinfo[fields[i]].identityField + ' = ' + theAlias2.alias + '.' + dbinfo[getobject].relations[fields[i]].foreignKey;

            } else {               
                var theAlias3 = _.findWhere(tableAliases, { 'table': fields[i-1] });
                console.log('Alias 3');
                console.log(theAlias3);
                theJoin += theAlias3.alias + '.' + dbinfo[fields[i]].relations[fields[i-1]].foreignKey + ' = ' + theAlias1.alias + '.' + dbinfo[fields[i-1]].identityField;
            }
            joins.push(theJoin);
        }
      }
      joins.forEach(function(aJoin) {
        theQuery += ' ' + aJoin + ' ';
      });
  }
  
  var theWhere = generateWhere(filter.where);
  theQuery += 'where ' + theWhere;
  console.log(theQuery);
})();
  

function generateWhere(obj) {
    var theWhere = '';
    console.log(tableAliases);
    for (var keys = Object.keys(obj), i = 0, end = keys.length; i < end; i++) {
        var key = keys[i];
        var value = obj[key];
        if (key === 'or' || key === 'and') {            
            theWhere += '(';
            for (var keys2 = Object.keys(value), i2 = 0, end2 = keys2.length; i2 < end2; i2++) {              
                var key2 = keys2[i2];
                var value2 = value[key2];                
                theWhere += generateWhere(value2);                 
                if (i2 != (end2 - 1)) {                    
                    theWhere += ' ' + key + ' ';  
                }
            } 
            theWhere += ')';
        } else {
            if (typeof value === 'object') {
                //value[Object.keys(value)[0]]
                theWhere += key + ' ' + Object.keys(value)[0] + ' :' + key;                
            } else {
                theWhere += key + ' = :' + key;                
            }
        }
    }
    
    return theWhere;
}
