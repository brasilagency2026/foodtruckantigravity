const https = require('https');
const token = process.env.VERCEL_TOKEN;
if (!token) { console.error('VERCEL_TOKEN missing'); process.exit(1); }
function get(path) {
  return new Promise((resolve, reject) => {
    const req = https.get({ hostname: 'api.vercel.com', path, headers: { Authorization: 'Bearer ' + token } }, (res) => {
      let out = '';
      res.on('data', (c) => out += c);
      res.on('end', () => resolve({ status: res.statusCode, body: out }));
    });
    req.on('error', (e) => reject(e));
  });
}
(async () => {
  try {
    const projs = await get('/v9/projects');
    const parsed = JSON.parse(projs.body);
    const projects = parsed.projects || parsed;
    const project = projects.find(p => p.name === 'food-truck-alert') || projects[0];
    if (!project) { console.error('No project found'); process.exit(1); }
    console.log('Project:', project.name, project.id);
    const endpoints = ['/v13/deployments','/v12/deployments','/v11/deployments','/v10/deployments','/v9/deployments','/v6/deployments'];
    for (const ep of endpoints) {
      try {
        const deps = await get(`${ep}?projectId=${project.id}&limit=10`);
        if (deps.status === 200) {
          const dParsed = JSON.parse(deps.body);
          console.log('OK endpoint:', ep);
          console.log(JSON.stringify(dParsed, null, 2));
          break;
        } else {
          console.warn('endpoint', ep, 'status', deps.status);
        }
      } catch (e) {
        console.warn('endpoint', ep, 'failed', e && e.message ? e.message : e);
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
