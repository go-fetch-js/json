
const Client = require('go-fetch');
const json = require('..');

new Client()
  .use(json())
  .get('http://httpbin.org/get')
    .then(res => {
      console.log(res.toString());
      return res.json();
    })
    .then(json => console.log(json))
    .catch(err => console.error(err.stack))
;
