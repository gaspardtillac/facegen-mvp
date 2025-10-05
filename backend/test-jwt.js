const jwt = require('jsonwebtoken');

const accessKeyId = process.env.KLING_ACCESS_KEY_ID;
const accessKeySecret = process.env.KLING_ACCESS_KEY_SECRET;

const now = Math.floor(Date.now() / 1000);

const payload = {
  iss: accessKeyId,
  exp: now + 1800,  // +30 minutes
  nbf: now - 300,   // -5 minutes (très large marge)
};

const token = jwt.sign(payload, accessKeySecret, { 
  algorithm: 'HS256'
});

console.log('JWT généré:');
console.log(token);
console.log('\nDétails:');
console.log('Timestamp actuel:', now);
console.log('Not Before (nbf):', now - 300);
console.log('Expires (exp):', now + 1800);
