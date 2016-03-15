const Client = require('go-fetch');
const json = require('..');

new Client()
  .use(json())
  .post('http://httpbin.org/post', {msg: 'Go fetch!'})
    .then(res => {
      console.log(res.toString(), res.isJSON());
      return res.json();
    })
    .then(json => console.log(json))
    .catch(err => console.error(err.stack))
;