'use strict';
const chai = require('chai');
const promised = require('chai-as-promised');
const sinon = require('sinon');
const str = require('string-to-stream');
const Request = require('go-fetch').Request;
const Response = require('go-fetch').Response;
const json = require('..');

chai.use(promised);
const expect = chai.expect;

describe('go-fetch-json', () => {

  it('should register beforeMiddleware() and afterMiddleware()', () => {

    const client = {};
    client.before = sinon.stub().returns(client);
    client.after = sinon.stub().returns(client);

    json()(client);

    expect(client.before.calledWith(json.beforeMiddleware)).to.be.true;
    expect(client.after.calledWith(json.afterMiddleware)).to.be.true;

  });

  describe('.before() middleware', () => {

    it('should add .isJSON() to the request', () => {

      const request = new Request();
      const next = sinon.spy();

      json.beforeMiddleware(request, next);

      expect(request).to.have.property('isJSON')
        .to.be.a('function')
      ;

    });

    it('should stringify and add headers when the request body is an object literal', () => {

      const request = new Request({body: {msg: 'Hello world!'}});
      const next = sinon.spy();

      json.beforeMiddleware(request, next);

      expect(request).to.have.property('body')
        .to.be.deep.equal('{"msg":"Hello world!"}')
      ;
      expect(request).to.have.property('headers')
        .to.have.property('content-type')
        .to.be.equal('application/json')
      ;
      expect(request).to.have.property('headers')
        .to.have.property('content-length')
        .to.be.equal(22)
      ;

    });

    it('should not stringify or add headers when the request body is a string', () => {

      const request = new Request({body: 'Hello world!'});
      const next = sinon.spy();

      json.beforeMiddleware(request, next);

      expect(request).to.have.property('body')
        .to.be.equal('Hello world!')
      ;
      expect(request).to.have.property('headers')
        .not.to.have.property('content-type')
      ;
      expect(request).to.have.property('headers')
        .not.to.have.property('content-length')
      ;

    });

    it('should not stringify or add headers when the request body is a stream', () => {

      const stream = str('Hello World!');
      const request = new Request({body: stream});
      const next = sinon.spy();

      json.beforeMiddleware(request, next);

      expect(request).to.have.property('body')
        .to.be.equal(stream)
      ;
      expect(request).to.have.property('headers')
        .not.to.have.property('content-type')
      ;
      expect(request).to.have.property('headers')
        .not.to.have.property('content-length')
      ;

    });

    it('should call next()', () => {

      const request = new Request();
      const next = sinon.spy();

      json.beforeMiddleware(request, next);

      expect(next.calledWith(null, request)).to.be.true;

    });

    it('should call next() with an error when the request body cannon be stringified', () => {

      const cyclic = {};
      cyclic.cyclic = cyclic;

      const request = new Request({body: cyclic});
      const next = sinon.spy();

      json.beforeMiddleware(request, next);

      expect(next.args[0][0]).to.be.instanceOf(Error);

    });

    describe('.toJSON()', () => {

      it('should return true when the content-type and content-length headers are set', () => {

        const request = new Request({headers: {'content-type': 'application/json', 'content-length': 20}});
        const next = sinon.spy();

        json.beforeMiddleware(request, next);

        expect(request.isJSON()).to.be.true;

      });

      it('should return false when the content-type header is not JSON', () => {

        const request = new Request({headers: {'content-type': 'text/html', 'content-length': 20}});
        const next = sinon.spy();

        json.beforeMiddleware(request, next);

        expect(request.isJSON()).to.be.false;

      });

      it('should return false when the content-type header is not set', () => {

        const request = new Request({headers: {'content-length': 20}});
        const next = sinon.spy();

        json.beforeMiddleware(request, next);

        expect(request.isJSON()).to.be.false;

      });

      it('should return true when the content-length header is not set', () => {

        const request = new Request({headers: {'content-type': 'application/json'}});
        const next = sinon.spy();

        json.beforeMiddleware(request, next);

        expect(request.isJSON()).to.be.false;

      });

    });

  });

  describe('.after() middleware', () => {

    it('should add .isJSON() to the response', () => {

      const response = new Response();
      const next = sinon.spy();

      json.afterMiddleware(response, next);

      expect(response).to.have.property('isJSON')
        .to.be.a('function')
      ;

    });

    it('should add .json() to the response', () => {

      const response = new Response();
      const next = sinon.spy();

      json.afterMiddleware(response, next);

      expect(response).to.have.property('json')
        .to.be.a('function')
      ;

    });

    it('should call next()', () => {

      const response = new Response();
      const next = sinon.spy();

      json.afterMiddleware(response, next);

      expect(next.calledWith(null, response)).to.be.true;
    });

    describe('.toJSON()', () => {

      it('should return true when the content-type is application/json and content-length is set', () => {

        const response = new Response({headers: {'content-type': 'application/json', 'content-length': 20}});
        const next = sinon.spy();

        json.afterMiddleware(response, next);

        expect(response.isJSON()).to.be.true;

      });

      it('should return true when the content-type is application/vnd.api+json and content-length is set', () => {

        const response = new Response({headers: {'content-type': 'application/vnd.api+json', 'content-length': 20}});
        const next = sinon.spy();

        json.afterMiddleware(response, next);

        expect(response.isJSON()).to.be.true;

      });

      it('should return false when the content-type is not JSON', () => {

        const response = new Response({headers: {'content-type': 'text/html', 'content-length': 20}});
        const next = sinon.spy();

        json.afterMiddleware(response, next);

        expect(response.isJSON()).to.be.false;

      }); 

      it('should return false when the content-type is not set', () => {

        const response = new Response({headers: {'content-length': 20}});
        const next = sinon.spy();

        json.afterMiddleware(response, next);

        expect(response.isJSON()).to.be.false;

      });

      it('should return false when the content-length is not set', () => {

        const response = new Response({headers: {'content-type': 'application/json'}});
        const next = sinon.spy();

        json.afterMiddleware(response, next);

        expect(response.isJSON()).to.be.false;

      });

    });

    describe('.json()', () => {

      it('should return a promise', () => {

        const response = new Response({body: '{}'});
        const next = sinon.spy();

        json.afterMiddleware(response, next);

        expect(response.json()).to.be.instanceOf(Promise);

      });

      it('should resolve with a JSON object when the body contains valid JSON', () => {

        const response = new Response({body: '{"msg": "Hello World!"}'});
        const next = sinon.spy();

        json.afterMiddleware(response, next);

        return expect(response.json()).to.eventually.be.deep.equal({msg: 'Hello World!'});

      });

      it('should reject with an error when the body does not contain valid JSON', () => {

        const response = new Response({body: 'blah blah not-json'});
        const next = sinon.spy();

        json.afterMiddleware(response, next);

        return expect(response.json()).to.be.rejected;

      });

    });

    });


});