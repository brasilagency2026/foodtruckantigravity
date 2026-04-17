const { generateKeyPair, exportPKCS8 } = require('jose');

async function run() {
  const { privateKey } = await generateKeyPair('RS256');
  const pkcs8 = await exportPKCS8(privateKey);
  console.log(pkcs8);
}

run();
