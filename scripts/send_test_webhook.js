const https = require('https');
const crypto = require('crypto');

const url = process.env.WEBHOOK_URL || 'https://food-truck-alert.vercel.app/api/webhooks/mercadopago';
const secret = process.env.MP_WEBHOOK_SECRET; // optional

const bodyObj = {
  data: { id: `test_payment_${Date.now()}` },
};
const body = JSON.stringify(bodyObj);

const headers = { 'Content-Type': 'application/json' };
if (secret) {
  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex');
  headers['x-signature'] = 'v1=' + sig;
}

const req = https.request(url, { method: 'POST', headers }, (res) => {
  let out = '';
  res.on('data', (c) => (out += c));
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    try {
      console.log('BODY', JSON.parse(out));
    } catch (e) {
      console.log('BODY', out);
    }
  });
});
req.on('error', (e) => console.error('ERR', e.message));
req.write(body);
req.end();
