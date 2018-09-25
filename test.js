const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const supertest = require('supertest');
var server = supertest.agent("http://localhost:8081"); //the server must already be running for the tests to work!

process.env['test'] = true;
describe('GET /', function() {
    it('responds with 302 to create-map', function(done) {
        server
        .get("/")
        .expect(302)
        .end(function(err, res) {
            expect(res.status).to.equal(302);
            expect(res.error).to.be.false;
            done();
        });
    });
});

describe('GET /profile', function() {
    it('responds with 200 profile', function(done) {
      server
        .get("/profile")
        .expect(200)
        .end(function(err,res) {
            expect(res.status).to.equal(200);
            expect(res.error).to.be.false;
            done();
        });
    });
});

describe('GET /splash', function() {
    it('responds with 200 splash', function(done) {
        server
        .get("/splash")
        .expect(200)
        .end(function(err, res) {
            expect(res.status).to.equal(200);
            expect(res.error).to.be.false;
            done();
        });
    });
});

describe('GET /*', function() {
    it('responds with 200 to notfound', function(done) {
        server
        .get("/*")
        .expect(200)
        .end(function(err, res) {
            expect(res.status).to.equal(200);
            expect(res.error).to.be.false;
            done();
        });
    });
});

describe('GET itinerary-form', function() {
    it('responds with 200 to create-form', function(done) {
        server
        .get("/trips/create/details")
        .expect(302)
        .end(function(err, res) {
            expect(res.status).to.equal(302);
            expect(res.error).to.be.false;
            done();
        });
    });
});

describe('POST /trips', function() {
    it('responds with 302 itinerary-form', function(done) {
        server
        .post("/trips")
        .send({markers : "test"})
        .expect(302)
        .end(function(err, res) {
            expect(res.status).to.equal(302);
            expect(res.error).to.be.false;
            done();
        });
    });
});