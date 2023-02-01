const crypto = require ("crypto");

const Securitykey = crypto.randomBytes(32).toString('hex');
const initVector = crypto.randomBytes(16).toString('hex');

const fs = require('fs')
fs.readFile('.env', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var result = data.replace(/(SECURITY_KEY=.*)/g, `SECURITY_KEY=${Securitykey}`);
  result = result.replace(/(SECURITY_IV=.*)/g, `SECURITY_IV=${initVector}`);

  fs.writeFile('.env', result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
});