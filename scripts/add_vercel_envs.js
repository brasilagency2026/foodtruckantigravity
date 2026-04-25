const https = require('https');
const fs = require('fs');

const token = process.env.VERCEL_TOKEN;
const newEnvsJson = process.env.NEW_ENVS_JSON;
if (!token) {
  console.error('VERCEL_TOKEN missing');
  process.exit(1);
}
if (!newEnvsJson) {
  console.error('NEW_ENVS_JSON missing');
  process.exit(1);
}
let newEnvs;
try {
  newEnvs = JSON.parse(newEnvsJson);
} catch (e) {
  console.error('Invalid NEW_ENVS_JSON:', e.message);
  process.exit(1);
}

function request(method, path, body) {
  const options = {
    hostname: 'api.vercel.com',
    path,
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let out = '';
      res.on('data', (c) => (out += c));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: out }));
    });
    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // Fetch projects
  const projResp = await request('GET', '/v9/projects');
  let projectsData;
  try {
    projectsData = JSON.parse(projResp.body);
  } catch (e) {
    console.error('Failed to parse projects response');
    console.error(projResp.body);
    process.exit(1);
  }
  const projects = projectsData.projects || projectsData || [];
  // Try to find the food-truck-alert project
  let project = projects.find((p) => p && p.name === 'food-truck-alert');
  if (!project) {
    project = projects.find((p) => p && p.name && p.name.includes('food-truck'));
  }
  if (!project) {
    project = projects.find((p) => p && p.name && p.name.includes('food'));
  }
  if (!project) {
    console.error('No matching project found in your Vercel account');
    process.exit(1);
  }
  const projectId = project.id;
  console.log('Using project:', project.name, projectId);

  // Fetch existing envs
  const envsResp = await request('GET', `/v9/projects/${projectId}/env`);
  let existing = [];
  try {
    const parsed = JSON.parse(envsResp.body);
    existing = parsed.envs || parsed;
  } catch (e) {
    existing = [];
  }
  if (!Array.isArray(existing)) existing = existing.items || [];

  for (const key of Object.keys(newEnvs)) {
    const value = newEnvs[key];
    const found = existing.find((e) => e.key === key);
    if (found && found.id) {
      // Update
      const patch = await request('PATCH', `/v9/projects/${projectId}/env/${found.id}`, {
        value,
        target: ['production'],
        type: 'encrypted',
      });
      if (patch.statusCode >= 200 && patch.statusCode < 300) {
        console.log('UPDATED:', key);
      } else {
        console.error('FAILED_UPDATE:', key, patch.statusCode);
      }
    } else {
      // Create
      const post = await request('POST', `/v9/projects/${projectId}/env`, {
        key,
        value,
        target: ['production'],
        type: 'encrypted',
      });
      if (post.statusCode >= 200 && post.statusCode < 300) {
        console.log('CREATED:', key);
      } else {
        console.error('FAILED_CREATE:', key, post.statusCode);
      }
    }
  }
}

main().catch((e) => {
  console.error('ERROR', e && e.stack ? e.stack : e);
  process.exit(1);
});
