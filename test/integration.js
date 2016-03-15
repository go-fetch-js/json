'use strict';
const chai = require('chai');
const promised = require('chai-as-promised');
const Client = require('go-fetch');
const json = require('..');

chai.use(promised);
const expect = chai.expect;

describe('go-fetch-json', () => {

  it('should receive a JSON body', () => {

    return new Client()
      .use(json())
      .get('http://httpbin.org/get')
      .then(res => {
        expect(res.isJSON()).to.be.true;
        return res.json();
      })
      .then(json => {
        expect(json).to.be.an('object');
      })
    ;

  });

  it('should send a JSON body', () => {

    return new Client()
      .use(json())
      .post('http://httpbin.org/post', {msg: 'Go fetch!'})
        .then(res => {
          expect(res.isJSON()).to.be.true;
          return res.json();
        })
        .then(json => expect(json).to.have.property('json').to.be.deep.equal({msg: 'Go fetch!'}))
    ;

  });

});