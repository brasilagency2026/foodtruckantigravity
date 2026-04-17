const crypto = require('crypto');

// Generate RS256 key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'jwk' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const jwks = JSON.stringify({ keys: [{ use: 'sig', kty: 'RSA', alg: 'RS256', ...publicKey }] });
const formattedPrivateKey = privateKey.trimEnd().replace(/\n/g, "\\n"); // Using \n as literal or space? Docs said space, but usually \n works in JSON/env. Wait, the docs said space.

console.log("JWT_PRIVATE_KEY:");
console.log(privateKey.trimEnd().replace(/\n/g, " ")); // Using space as per the doc snippet
console.log("\nJWKS:");
console.log(jwks);
