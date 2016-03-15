'use strict';
const isType = require('type-is');

function isLiteralObject(val) {
  return val && val.constructor === Object;
}

function isJSON() {
  return isType(this, ['json']) === 'json'
}

function json() {
  return this.text().then(text => JSON.parse(text));
}

/**
 * Modify the request
 * @param {Request}   req
 * @param {function}  next
 */
function beforeMiddleware(req, next) {

  req.isJSON = isJSON;

  if (isLiteralObject(req.body)) {
    try {
      req.body = JSON.stringify(req.body);
      req.headers['content-type'] = 'application/json'; //TODO: make this configurable
      req.headers['content-length'] = req.body.length;
    } catch (err) {
      return next(err);
    }
  }

  next(null, req);
}

/**
 * Modify the response
 * @param {Response}  res
 * @param {function}  next
 */
function afterMiddleware(res, next) {

  res.isJSON = isJSON;
  res.json = json;

  next(null, res);
}

module.exports = function() {
  return client => {
    client
      .before(beforeMiddleware)
      .after(afterMiddleware)
    ;
  };
};

module.exports.beforeMiddleware = beforeMiddleware;
module.exports.afterMiddleware = afterMiddleware;