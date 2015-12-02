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
			{ "columnName": "name", "alias": "projectName" },
			{ "columnName": "code", "alias": "projectCode" },
			{ "columnName": "remarks", "alias": "projectRemarks" }						
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
			  "foreignKey": "customerId"	
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
  theQuery += 'select * from ' + dbinfo[getobject].table;
  
  // Als de query includes bevat
  if (filter.include) {
      for(var propertyName in filter.include) {
        
        var fields = filter.include[propertyName].split('.');
        for (var i = 0; i < fields.length; ++i) {  
            // controle op de table alias en deze bijhouden in de tableAliases Array
            
            var theJoin = 'left join ' + dbinfo[fields[i]].table + ' ' + dbinfo[fields[i]].tableAlias + ' on ';
          
            if (i === 0) {
                theJoin += dbinfo[fields[i]].tableAlias + '.' + dbinfo[fields[i]].identityField + ' = ' + dbinfo[getobject].tableAlias + '.' + dbinfo[getobject].relations[fields[i]].foreignKey;
            } else {
                theJoin += dbinfo[fields[i]].tableAlias + '.' + dbinfo[fields[i]].relations[fields[i-1]].foreignKey + ' = ' + dbinfo[fields[i-1]].tableAlias + '.' + dbinfo[fields[i-1]].identityField;
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



/*function generateWhere(obj) {
  var theWhere = '';
  for(var propertyName in obj) {
    console.log('obj: ' + propertyName);
    if (propertyName === 'or' || propertyName === 'and') {
      // Indien een 'or' of 'and' aanwezig is, dan is het object een array
      console.log('het is or/and');
      console.log(obj[propertyName]);
      theWhere += '(';
      for (var subObj in obj[propertyName]) {
        console.log('subObj: ' + obj[propertyName][subObj]);
        console.log(obj[propertyName][subObj]);
        console.log('opnieuw where oproepen');
        theWhere += generateWhere(obj[propertyName][subObj]) + ' ' + propertyName + ' ';        
      }
      theWhere += ')';
    } else {
      // Hier gaat het om een gewoon object met eventueel een operator
      console.log('Het veld: ' + obj[propertyName]);
      console.log(obj[propertyName]);
      if (typeof obj[propertyName] === 'object') {
        console.log('het is een object');
      } else {
        console.log('het is een waarde');
        console.log('Waarde: ' + obj);
        console.log(obj);
        console.log(obj[propertyName]);
        console.log(propertyName);
        theWhere += propertyName + ' = ' + ':' + propertyName;
      }    
    }
  }
  
  console.log('return theWhere: ' + theWhere);
  return theWhere;
}*/















