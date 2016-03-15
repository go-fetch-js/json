# go-fetch-json

[![Build Status](https://travis-ci.org/go-fetch-js/json.svg?branch=master)](https://travis-ci.org/go-fetch-js/json)

A plugin for `go-fetch` that makes working with JSON easier.

## Installation

    npm install --save go-fetch-json

## Usage

```javascript

const Client = require('go-fetch');
const json = require('go-fetch-json');

new Client()
  .use(json())
  .post('http://httpbin.org/post', {msg: 'Go fetch!'}) //send an object as JSON
    .then(res => {
      console.log('Is JSON?', res.isJSON());
      return res.json(); //buffer and parse the body as JSON
    })
    .then(json => console.log(json))
    .catch(err => console.error(err.stack))
;

```
