var assert = require('assert');
var should = require('should');
var request = require('supertest');  

// https://thewayofcode.wordpress.com/2013/04/21/how-to-build-and-test-rest-api-with-nodejs-express-mocha/


describe('Routing', function() {
  var url = 'http://localhost:1337/api';
  
  // Hier kan je alles van config plaatsen die nodig is voor de volgende testen
 
  describe('Projects', function() {
    it('getAllProjects', function(done) {
      request(url)
            .get('/projects')
            .end(function(err, res) {
              if (err) {
                throw err;
              }
              
              res.should.have.property('status', 200);
              
              done();
            });
        });
  
    it('createProject', function(done) {
       var project = {
          Name: "Project",
          Remarks: "Opmerking",
          Barcode: "P00000954"
        };
        
        request(url)
            .post('/projects')
            .send(project)
            .end(function(err, res) {
              if (err) {
                throw err;
              }
              
              res.should.have.property('status', 200);
              
              done();
            });
        });
    });
   
});